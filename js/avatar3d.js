/* ============================================================
   AVATAR 3D  (TalkingHead + three.js)
   Misma interfaz que el avatar ilustrado:  Avatar.mount(el) · speak(texto) · expr(nombre) · stop() · muted
   - Muestra primero el avatar ilustrado y lo reemplaza por el 3D cuando termina de cargar.
   - Si el 3D no puede cargar (p. ej. al abrir index.html con doble clic), se queda el ilustrado.
   ============================================================ */
const Avatar = {
  muted: false, modo: 'svg', head: null, caja: null, cps: 14,   // cps = letras por segundo (se calibra sola)

  // El avatar ilustrado y el 3D viven en cajas SEPARADAS: así uno nunca borra al otro.
  // El avatar ilustrado va en su propia capa; el 3D se coloca en la pantalla ACTUAL cuando está listo
  // (aunque el usuario haya cambiado de sección mientras cargaba).
  mount(el) {
    this.el = el; el.innerHTML = ''; el.style.position = 'relative';
    if ((window.CONFIG_AVATAR || {}).estilo !== 'realista' && window.Asistente3D) return this.montarToon(el);   // personaje animado (por defecto)
    this.capa = document.createElement('div'); el.appendChild(this.capa);
    AvatarSVG.mount(this.capa);                                   // respaldo inmediato
    this.aviso = document.createElement('small');                // mensaje mientras carga el 3D
    this.aviso.style.cssText = 'position:absolute;left:4px;bottom:4px;z-index:2;padding:1px 6px;border:1.5px solid #111;border-radius:10px;background:#fff;font-size:11px';
    this.aviso.textContent = this.head ? '' : 'Cargando avatar 3D…'; el.appendChild(this.aviso);
    if (this.head) { this.mostrar3D(); return; }                  // ya cargado antes: reutilizar
    if (!this.cargando) {
      this.cargando = this.cargar3D().then(() => this.mostrar3D())
        .catch(e => { console.warn('Avatar 3D no disponible, se usa el avatar ilustrado:', e.message); this.aviso && (this.aviso.textContent = 'Avatar ilustrado (3D no disponible)'); })
        .finally(() => (this.cargando = null));
    }
  },

  // ---------- Personaje animado (js/avatar-toon.bundle.js). Funciona también abriendo index.html con doble clic ----------
  montarToon(el) {
    const cfg = window.CONFIG_AVATAR || {};
    if (this.toon) { try { this.toon.dispose(); } catch (e) {} }
    const glb = (cfg.modelo ?? 'avatars/asistente.glb') && location.protocol !== 'file:' && window.AsistenteVRM;   // modelo .glb (necesita iniciar.bat)
    const propio = () => { const t = new Asistente3D(el, { calidad: cfg.calidad ?? 2 }); if (cfg.uniforme) t.vestir(cfg.uniforme); t.start(); return t; };
    if (glb) {
      const v = new AsistenteVRM(el, { calidad: cfg.calidad ?? 2, url: cfg.modelo ?? 'avatars/asistente.glb', saludoAuto: false }); this.toon = v;
      v.carga.catch(e => { console.warn('No se pudo cargar el modelo .glb, se usa el personaje de código:', e.message); if (this.toon === v) { v.dispose(); this.toon = propio(); } });
    } else this.toon = propio();
    el.style.cursor = 'pointer'; el.title = '¡Haz clic!'; el.onclick = () => { if (this.toon && this.toon.reaccionar) this.toon.reaccionar(); };
    this.toon.start(); this.modo = 'toon'; setTimeout(() => this.toon && this.toon.saludar(), 900);
  },

  // Voz del navegador (o Google si hay clave) + boca animada por palabras
  async hablarToon(t) {
    const cfg = window.CONFIG_AVATAR || {}, toon = this.toon;
    const palabras = t.split(/\s+/).filter(Boolean), inicios = []; { let i = 0; palabras.forEach(p => { i = t.indexOf(p, i); inicios.push(i); i += p.length; }); }
    const reparte = seg => { const total = palabras.reduce((s, p) => s + p.length + 1, 0); let ms = 0; const tiempos = [], duraciones = [];
      palabras.forEach(p => { const d = (p.length + 1) / total * seg * 1000; tiempos.push(ms); duraciones.push(d * .95); ms += d; }); return { palabras, tiempos, duraciones }; };
    const fin = ms => setTimeout(() => { if (this.toon === toon && !toon.hablando) this.expr('neutral'); }, ms + 300);
    if (cfg.googleTtsKey && !this.muted) {
      try {
        const r = await fetch('https://texttospeech.googleapis.com/v1/text:synthesize?key=' + cfg.googleTtsKey, { method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ input: { text: t }, voice: { languageCode: cfg.idioma || 'es-US', name: cfg.voz || 'es-US-Neural2-A' }, audioConfig: { audioEncoding: 'MP3' } }) });
        const j = await r.json(); if (!j.audioContent) throw new Error(JSON.stringify(j.error || j));
        const audio = new Audio('data:audio/mp3;base64,' + j.audioContent); this.audio = audio;
        audio.onloadedmetadata = () => { toon.hablar(reparte(audio.duration)); audio.play(); fin(audio.duration * 1000); };
        return;
      } catch (e) { console.warn('Google TTS falló, se usa la voz del navegador:', e.message); }
    }
    const seg = Math.max(1, t.length / this.cps); toon.hablar(reparte(seg)); fin(seg * 1000);
    if (!this.muted && window.speechSynthesis) {
      // frase por frase, con pausas cortas y pequeñas variaciones de ritmo/tono (suena menos robótico)
      const trozos = []; { let o = 0; t.split(/(?<=[.!?:;])\s+/).forEach(x => { const i = t.indexOf(x, o); trozos.push([x, i]); o = i + x.length; }); }
      let v = this.vozFemenina(); let t0 = 0, k = 0; speechSynthesis.cancel();
      const sig = () => {
        if (this.toon !== toon) return;
        if (k >= trozos.length) { if (t0) this.cps = .6 * this.cps + .4 * (t.length / ((performance.now() - t0) / 1000)); toon.detener(); this.expr('neutral'); return; }
        const [x, off] = trozos[k++], u = new SpeechSynthesisUtterance(x); u.lang = 'es-MX'; if (v) { u.voice = v; u.lang = v.lang; }
        u.pitch = 1.05 + Math.random() * .08; u.rate = 1.1 + Math.random() * .07;
        u.onstart = () => { if (!t0) t0 = performance.now(); };
        u.onboundary = e => { if (e.name && e.name !== 'word') return; const c = off + e.charIndex; const i = inicios.findIndex((s, q) => c >= s && (q === inicios.length - 1 || c < inicios[q + 1])); if (i >= 0) toon.palabra(i); };
        u.onend = () => setTimeout(sig, k < trozos.length ? 30 + Math.random() * 50 : 0);
        speechSynthesis.speak(u);
      };
      // la primera vez el navegador aún no ha cargado sus voces: se espera a que estén listas para no usar la voz por defecto (masculina)
      this.esperarVoces().then(() => { if (this.toon !== toon) return; v = this.vozFemenina(); sig(); });
    }
  },

  async cargar3D() {
    if (location.protocol === 'file:') throw new Error('abra la página con iniciar.bat (servidor local)');
    const cfg = window.CONFIG_AVATAR || {};
    const { TalkingHead } = await import('talkinghead');
    const caja = document.createElement('div');                   // se carga fuera de pantalla y luego se mueve
    caja.style.cssText = 'position:fixed;left:-10000px;top:0;width:340px;height:400px';
    document.body.appendChild(caja);
    const opciones = { lipsyncModules: ['es'], lipsyncLang: 'es', cameraView: cfg.vista || 'head',
      cameraDistance: cfg.acercar ?? 0.6, cameraX: cfg.cameraX ?? 0, cameraY: cfg.cameraY ?? 0, modelPixelRatio: cfg.calidad ?? 2, lightAmbientIntensity: 1.1, lightDirectIntensity: 14,
      dracoEnabled: true, dracoDecoderPath: './vendor/three/examples/jsm/libs/draco/gltf/', cameraRotateEnable: false, cameraZoomEnable: false, cameraPanEnable: false, modelFPS: 30 };
    if (cfg.googleTtsKey) {
      opciones.ttsEndpoint = 'https://texttospeech.googleapis.com/v1beta1/text:synthesize';
      opciones.ttsApikey = cfg.googleTtsKey;
    }
    const head = new TalkingHead(caja, opciones);
    await head.showAvatar({ url: cfg.avatar || 'avatars/mpfb.glb', body: 'F', avatarMood: 'neutral',
      ttsLang: cfg.idioma || 'es-US', ttsVoice: cfg.voz || 'es-US-Neural2-A', lipsyncLang: 'es' });
    this.head = head; this.caja = caja; this.vestir(cfg.uniforme);
    document.addEventListener('visibilitychange', () => (document.hidden ? head.stop() : head.start()));
  },

  // Cambia el color de la ropa del modelo (uniforme clínico). Pasar '' para dejar la ropa original.
  vestir(color) {
    if (!color) return;
    this.head.scene.traverse(o => {
      if (o.isMesh && /suit|shirt|cloth|top|look|uniform/i.test(o.name)) {
        (Array.isArray(o.material) ? o.material : [o.material]).forEach(m => { m.map = null; m.color.set(color); m.needsUpdate = true; });
      }
    });
  },

  mostrar3D() {                                                   // pone el 3D en la pantalla actual
    if (!this.head || !this.el || !document.body.contains(this.el)) return;
    this.caja.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;opacity:1';
    this.el.appendChild(this.caja); this.capa.style.display = 'none';
    this.modo = '3d'; this.head.start(); this.aviso && this.aviso.remove();
  },

  // Expresión según lo que va a decir: duda → pensativa, signo ¡! → sorprendida, el resto → sonriente
  animoDe(t) { if (/¡|!/.test(t) && !/\?/.test(t)) return 'sorpresa'; if (/\?|todavía|aún no|no encontr|no puedo|duda/i.test(t)) return 'pensando'; return 'feliz'; },

  expr(nombre) {
    if (this.modo === 'toon') this.toon.setMood({ feliz: 'feliz', pensando: 'pensando', sorpresa: 'sorpresa' }[nombre] || 'sonrisa');
    else if (this.modo === '3d') this.head.setMood({ feliz: 'happy' }[nombre] || 'neutral');
    else AvatarSVG.expr(nombre);
  },

  speak(texto) {
    const t = texto.replace(/<[^>]+>/g, '');
    if (this.modo === 'toon') { this.stop(); this.expr(this.animoDe(t)); return this.hablarToon(t); }
    if (this.modo !== '3d') { AvatarSVG.muted = this.muted; return AvatarSVG.speak(t); }
    this.stop(); this.expr('feliz');
    if ((window.CONFIG_AVATAR || {}).googleTtsKey && !this.muted) this.head.speakText(t, { lipsyncLang: 'es' });
    else this.hablarSinClave(t);
  },

  // Sin clave de Google: voz del navegador + boca animada con tiempos estimados (silencio con palabras cronometradas)
  async hablarSinClave(t) {
    const head = this.head, ctx = head.audioCtx;
    try { await ctx.resume(); } catch (e) {}
    const palabras = t.split(/\s+/).filter(Boolean), seg = Math.max(1, t.length / this.cps);
    const total = palabras.reduce((s, p) => s + p.length + 1, 0);
    let ms = 0; const wtimes = [], wdurations = [];
    palabras.forEach(p => { const d = (p.length + 1) / total * seg * 1000; wtimes.push(ms); wdurations.push(d * 0.95); ms += d; });
    const buf = ctx.createBuffer(1, Math.ceil(ctx.sampleRate * (seg + 0.3)), ctx.sampleRate);   // audio en silencio
    if (!this.muted && window.speechSynthesis) {
      await this.esperarVoces();
      const u = new SpeechSynthesisUtterance(t); u.lang = 'es-MX';
      const v = this.vozFemenina(); if (v) { u.voice = v; u.lang = v.lang; }
      u.pitch = 1.25; u.rate = 1.0;   // tono más agudo = voz más femenina
      let t0 = 0; u.onstart = () => (t0 = performance.now());
      u.onend = () => { if (t0) this.cps = 0.6 * this.cps + 0.4 * (t.length / ((performance.now() - t0) / 1000)); };  // calibra
      speechSynthesis.cancel(); speechSynthesis.speak(u);
    }
    head.speakAudio({ audio: buf, words: palabras, wtimes, wdurations });
  },

  // Las voces del navegador se cargan de forma asíncrona: devuelve una promesa que se cumple cuando ya hay voces (o tras 2.5 s)
  esperarVoces() {
    if (!window.speechSynthesis) return Promise.resolve();
    const listo = () => speechSynthesis.getVoices().some(x => /^es/i.test(x.lang));
    if (listo()) return Promise.resolve();
    return new Promise(ok => {
      let fin = false; const salir = () => { if (fin) return; fin = true; clearInterval(iv); speechSynthesis.removeEventListener('voiceschanged', cambio); ok(); };
      const cambio = () => { if (listo()) setTimeout(salir, 150); };   // a veces llegan primero las voces básicas y luego las naturales
      speechSynthesis.addEventListener('voiceschanged', cambio);
      const iv = setInterval(() => { if (listo()) salir(); }, 120); setTimeout(salir, 2500);
    });
  },

  // Elige la voz femenina en español más natural disponible en el navegador/sistema
  vozFemenina() {
    const pref = /sabina|helena|dalia|paulina|monica|mónica|elena|lucia|lucía|marisol|camila|female|mujer|google español|google es/i;
    const noPref = /jorge|diego|pablo|raul|raúl|carlos|enrique|juan|male\b/i;
    const es = speechSynthesis.getVoices().filter(x => /^es/i.test(x.lang));
    const rank = x => (pref.test(x.name) ? 4 : 0) - (noPref.test(x.name) ? 6 : 0) + (/natural|neural|online/i.test(x.name) ? 8 : 0) + (/es-MX|es-US/i.test(x.lang) ? 1 : 0);
    return es.sort((a, b) => rank(b) - rank(a))[0];
  },

  stop() {
    if (this.modo === 'toon') { this.toon.detener(); if (this.audio) { this.audio.pause(); this.audio = null; } if (window.speechSynthesis) speechSynthesis.cancel(); return; }
    if (this.modo === '3d') { try { this.head.stopSpeaking(); } catch (e) {} }
    else AvatarSVG.stop();
  }
};

// Precarga de voces del navegador (así la primera respuesta ya sale con la voz femenina)
try { if (window.speechSynthesis) { speechSynthesis.getVoices(); speechSynthesis.addEventListener('voiceschanged', () => speechSynthesis.getVoices()); } } catch (e) {}
