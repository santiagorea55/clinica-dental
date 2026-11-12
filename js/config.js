/* ============================================================
   CONFIGURACIÓN DEL AVATAR 3D  (edite aquí)
   ============================================================ */
window.CONFIG_AVATAR = {
  // Clave de Google Cloud Text-to-Speech. Con clave: voz natural y boca sincronizada con precisión.
  // Sin clave (''): usa la voz del navegador y la boca se mueve calculando el tiempo (menos exacto).
  // IMPORTANTE: no suba esta clave a internet; solo úsela en su computadora.
  googleTtsKey: '',
  voz: 'es-US-Neural2-A',     // voz de Google (femenina). Otras: es-US-Neural2-B/C, es-ES-Neural2-A
  idioma: 'es-US',
  modelo: 'avatars/asistente.glb',   // tu personaje en .glb (VRoid). '' = usar el personaje creado con código. Necesita iniciar.bat
  estilo: 'animado',          // 'animado' = personaje caricatura (por defecto) · 'realista' = modelo avatars/mpfb.glb (requiere iniciar.bat)
  avatar: '', // modelo 3D (necesita blendshapes ARKit + visemas)
  acercar: -1.15,   // acercamiento de la cámara (más negativo = más cerca; antes -0.8)
  cameraX: 0, cameraY: 0.12,     // desplazamiento de la cámara (para centrar la cara)
  calidad: 2,                 // nitidez (1 = normal, 2 = alta; más alto pesa más)
  uniforme: '#2f9e8f',        // color de la ropa ('' = ropa original). Ej.: blanco '#f4f7f9', verde quirúrgico '#2f9e8f', azul '#35a6b8'
  vista: 'upper'               // encuadre: 'head' (solo cara), 'upper' (busto), 'mid', 'full'
};

/* ============================================================
   ASISTENTE · respuestas automáticas
   respuestas: false = no responde (solo avisa que está en entrenamiento) · true = responde con js/asistente.js
   clasificar: true = usa la red neuronal entrenada (carpeta modelo/) para detectar el tema; si no existe, usa solo palabras clave.
   ============================================================ */
window.CONFIG_ASISTENTE = { respuestas: true, clasificar: true };

/* ============================================================
   FONDO · figuras dentales que flotan
   cantidad: cuántas hay a la vez (en pantalla de 1280 px de ancho; más grande = más)
   figuras:  qué tan seguido sale cada una. 0 = no sale · 1 = normal · 3 = tres veces más seguido
   ============================================================ */
window.CONFIG_FONDO = {
  cantidad: 22,
  figuras: { diente: 4, cepillo: 4, brillo: 1, espejo: 0.5, escudo: 0.5 }
};
