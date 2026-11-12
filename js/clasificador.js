/* ============================================================
   CLASIFICADOR · usa los 3 modelos entrenados (carpeta modelo/)
   texto -> normalizar -> tokenizar -> quitar stopwords -> vector (Bag of Words binario) -> 3 redes:
     dominio   (a qué área pertenece)   · tema (de qué trata)   · intención (qué quiere el usuario)
   Es el MISMO preprocesamiento del proceso de entrenamiento (entrenamiento_v3_dos_fuentes); si cambia allá, cambia aquí.
   Archivos que necesita (salen de 04_exportar.bat, carpeta modelo_exportado/modelo_<fecha>/):
     modelo/dominio/  modelo/tema/  modelo/intencion/  (cada una con model.json y weights.bin)
     modelo/vocabulario.json  modelo/metadata.json
     vendor/tfjs/tf.min.js  (si no está, se descarga de internet)
   Necesita abrir la página con iniciar.bat (servidor local): con doble clic en index.html el navegador bloquea la carga.
   ============================================================ */
const Clasificador = (() => {
  const STOPWORDS = new Set(['a', 'al', 'de', 'del', 'el', 'la', 'las', 'los', 'un', 'una', 'unos', 'unas', 'y', 'o', 'en', 'por', 'para', 'con', 'se', 'su', 'sus', 'es', 'son']);
  // Dominios del modelo -> secciones de la página
  const MAPA = { tratamientos: 'servicios', contacto: 'contacto', equipo_clinico: 'nosotros', instalaciones_tecnologia: 'nosotros', casos_clinicos: 'casos', privacidad_legal: 'legal' };
  const NOMBRES = { servicios: 'Servicios', casos: 'Casos clínicos', nosotros: 'Nosotros', contacto: 'Contacto', legal: 'Legal' };
  const SALIDAS = ['dominio', 'tema', 'intencion'];
  let modelos = null, vocabulario = [], indice = new Map(), etiquetas = {}, promesa = null;

  const normalizar = t => String(t).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[¿?¡!.,;:()[\]{}"'“”‘’/\\|@#$%^&*_+=<>~-]/g, ' ').replace(/\s+/g, ' ').trim();
  const tokenizar = t => normalizar(t).split(' ').filter(Boolean).filter(x => !STOPWORDS.has(x));

  function cargarScript(src) {
    return new Promise((ok, mal) => { const s = document.createElement('script'); s.src = src; s.onload = ok; s.onerror = () => mal(new Error('No se pudo cargar ' + src)); document.head.appendChild(s); });
  }

  async function iniciar() {
    if (!window.tf) {
      try { await cargarScript('vendor/tfjs/tf.min.js'); }
      catch (e) { await cargarScript('https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@4.22.0/dist/tf.min.js'); }
    }
    const [v, m] = await Promise.all([fetch('modelo/vocabulario.json').then(r => r.json()), fetch('modelo/metadata.json').then(r => r.json())]);
    vocabulario = v; etiquetas = m.labels; indice = new Map(v.map((p, i) => [p, i]));
    const cargados = await Promise.all(SALIDAS.map(s => tf.loadLayersModel(`modelo/${s}/model.json`)));
    modelos = Object.fromEntries(SALIDAS.map((s, i) => [s, cargados[i]]));
    return true;
  }

  return {
    // Carga los modelos una sola vez. Devuelve true si quedó listo, false si falta algo (la página sigue funcionando).
    cargar() {
      if (!promesa) promesa = iniciar().catch(e => { console.warn('[Clasificador] no disponible:', e.message); modelos = null; return false; });
      return promesa;
    },
    get listo() { return !!modelos; },
    get vocabulario() { return vocabulario; },
    nombre: d => NOMBRES[d] || d,

    // Devuelve { dominio (sección de la página), dominioModelo, confianza, tema, temaConfianza, intencion, intencionConfianza, tokens }
    // o dominio:null si ninguna palabra está en el vocabulario.
    predecir(texto) {
      if (!modelos) return null;
      const tokens = tokenizar(texto);
      const vector = new Array(vocabulario.length).fill(0);
      let conocidas = 0;
      new Set(tokens).forEach(t => { const i = indice.get(t); if (i !== undefined) { vector[i] = 1; conocidas++; } });
      if (!conocidas) return { dominio: null, confianza: 0, tema: null, temaConfianza: 0, intencion: null, intencionConfianza: 0, tokens };
      const r = {};
      SALIDAS.forEach(s => {
        const p = tf.tidy(() => Array.from(modelos[s].predict(tf.tensor2d([vector])).dataSync()));
        const k = p.indexOf(Math.max(...p));
        r[s] = { etiqueta: etiquetas[s][k], confianza: p[k] };
      });
      const unicos = new Set(tokens).size || 1, cobertura = conocidas / unicos;   // qué parte de lo escrito conoce el modelo
      // Fuera de tema: si el modelo solo reconoce una parte pequeña de la frase, no se fía de su "seguridad"
      if (cobertura < .8) return { dominio: null, confianza: 0, tema: null, temaConfianza: 0, intencion: null, intencionConfianza: 0, tokens, cobertura, fueraDeTema: true };
      return { cobertura, dominio: MAPA[r.dominio.etiqueta] || null, dominioModelo: r.dominio.etiqueta, confianza: r.dominio.confianza,
        tema: r.tema.etiqueta, temaConfianza: r.tema.confianza, intencion: r.intencion.etiqueta, intencionConfianza: r.intencion.confianza, tokens };
    }
  };
})();
