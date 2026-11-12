/**
* @class Spanish lip-sync processor
*
* Rule-based grapheme-to-viseme conversion for Spanish (Latin American, "seseo").
* Spanish spelling is almost phonetic, so a letter table plus a few context rules is enough:
* - digraphs ch, ll, rr, qu, gu / gü, soft c and g (ce, ci, ge, gi), silent h
* - numbers, decimals and common symbols read in Spanish
*/
class LipsyncEs {

  constructor() {
    // Letters to Oculus visemes (when no context rule applies)
    this.visemes = {
      'a': 'aa', 'á': 'aa', 'à': 'aa', 'e': 'E', 'é': 'E', 'è': 'E',
      'i': 'I', 'í': 'I', 'o': 'O', 'ó': 'O', 'u': 'U', 'ú': 'U', 'ü': 'U', 'w': 'U',
      'b': 'PP', 'p': 'PP', 'm': 'PP', 'v': 'PP', 'f': 'FF', 'd': 'DD', 't': 'DD',
      'k': 'kk', 'q': 'kk', 'g': 'kk', 'j': 'kk', 'x': 'kk', 'c': 'kk',
      's': 'SS', 'z': 'SS', 'n': 'nn', 'ñ': 'nn', 'l': 'nn', 'r': 'RR'
    };

    // Viseme durations in relative units (1=average)
    this.visemeDurations = {
      'aa': 0.95, 'E': 0.90, 'I': 0.92, 'O': 0.96, 'U': 0.95, 'PP': 1.08, 'SS': 1.23,
      'DD': 1.05, 'FF': 1.00, 'kk': 1.21, 'nn': 0.88, 'RR': 0.88, 'CH': 1.2, 'sil': 1
    };

    // Pauses in relative units (1=average)
    this.specialDurations = { ' ': 1, ',': 3, '-': 0.5 };

    this.symbols = { '%': 'por ciento', '$': 'pesos', '€': 'euros', '&': 'y', '+': 'más', '@': 'arroba' };
    this.symbolsReg = /[%€&\+\$@]/g;

    this.units = ['cero', 'uno', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve', 'diez',
      'once', 'doce', 'trece', 'catorce', 'quince', 'dieciséis', 'diecisiete', 'dieciocho', 'diecinueve',
      'veinte', 'veintiuno', 'veintidós', 'veintitrés', 'veinticuatro', 'veinticinco', 'veintiséis',
      'veintisiete', 'veintiocho', 'veintinueve'];
    this.tens = ['', '', '', 'treinta', 'cuarenta', 'cincuenta', 'sesenta', 'setenta', 'ochenta', 'noventa'];
    this.hundreds = ['', 'ciento', 'doscientos', 'trescientos', 'cuatrocientos', 'quinientos',
      'seiscientos', 'setecientos', 'ochocientos', 'novecientos'];
  }

  /** Integer (< 10^12) to Spanish words. */
  intToWords(n) {
    if (n < 30) return this.units[n];
    if (n < 100) return this.tens[Math.floor(n / 10)] + (n % 10 ? ' y ' + this.units[n % 10] : '');
    if (n === 100) return 'cien';
    if (n < 1000) return this.hundreds[Math.floor(n / 100)] + (n % 100 ? ' ' + this.intToWords(n % 100) : '');
    if (n < 1e6) {
      const m = Math.floor(n / 1000), r = n % 1000;
      return (m === 1 ? 'mil' : this.intToWords(m) + ' mil') + (r ? ' ' + this.intToWords(r) : '');
    }
    const m = Math.floor(n / 1e6), r = n % 1e6;
    return (m === 1 ? 'un millón' : this.intToWords(m) + ' millones') + (r ? ' ' + this.intToWords(r) : '');
  }

  /** Number string (e.g. "12.5" or "300") to Spanish words. */
  numberToSpanishWords(x) {
    const [i, d] = x.split('.');
    let s = this.intToWords(parseInt(i, 10));
    if (d) s += ' coma ' + [...d].map(c => this.units[+c]).join(' ');
    return s;
  }

  /** Symbols and numbers to words; remove characters that are not spoken. */
  preProcessText(s) {
    return s.replace(/[#_*\'\":;]/g, '')
      .replace(this.symbolsReg, (m) => ' ' + this.symbols[m] + ' ')
      .replace(/(\d),(\d)/g, '$1.$2')
      .replace(/\d+(\.\d+)?/g, (m) => this.numberToSpanishWords(m))
      .replace(/\s{2,}/g, ' ')
      .trim();
  }

  /** Words to Oculus visemes with relative times and durations. */
  wordsToVisemes(w) {
    const o = { words: w, visemes: [], times: [], durations: [] };
    let t = 0;
    const chars = [...w.toLowerCase().normalize('NFC')];
    const isFront = (c) => c === 'e' || c === 'i' || c === 'é' || c === 'í';

    for (let i = 0; i < chars.length; i++) {
      const c = chars[i], n = chars[i + 1] || '', n2 = chars[i + 2] || '';
      let viseme = null;

      if (c === 'h') { if (n !== undefined) viseme = null; }            // silent h (ch is handled below)
      else if (c === 'c') {
        if (n === 'h') { viseme = 'CH'; i++; }
        else viseme = isFront(n) ? 'SS' : 'kk';
      }
      else if (c === 'q') { viseme = 'kk'; if (n === 'u') i++; }       // que, qui: silent u
      else if (c === 'g') { viseme = 'kk'; if (n === 'u' && isFront(n2)) i++; }  // gue, gui: silent u
      else if (c === 'l' && n === 'l') { viseme = 'CH'; i++; }
      else if (c === 'y') { viseme = (i === chars.length - 1 || chars.length === 1) ? 'I' : 'CH'; }
      else viseme = this.visemes[c] || null;

      if (viseme) {
        const dur = this.visemeDurations[viseme] || 1;
        if (o.visemes.length && o.visemes[o.visemes.length - 1] === viseme) {
          const d = 0.7 * dur;
          o.durations[o.durations.length - 1] += d;
          t += d;
        } else {
          o.visemes.push(viseme); o.times.push(t); o.durations.push(dur);
          t += dur;
        }
      } else {
        t += this.specialDurations[c] || 0;
      }
    }
    return o;
  }
}

export { LipsyncEs };
