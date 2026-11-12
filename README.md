# Clínica Dra. Janet · sitio web con asistente virtual (React)

## Cómo abrirlo
- **Con avatar 3D (recomendado):** Windows -> doble clic en `iniciar.bat` (necesita Python). Mac/Linux -> `iniciar.command`.
  Deje esa ventana abierta mientras lo usa. Necesita Chrome o Edge de escritorio.
- **Sin servidor:** doble clic en `index.html`. Funciona igual pero con el avatar ilustrado (el 3D no puede cargar así).

## Diseño (React + paleta)
- Colores: variables al inicio de `css/styles.css` (azul marino, azul médico, azul suave, blanco, gris claro, gris oscuro).
- Animaciones, transparencias y desvanecidos: también en `css/styles.css` (se desactivan solas si el equipo pide menos movimiento).
- El código React está en `src/` (`main.jsx`, `inicio.jsx`, `vistas.jsx`, `ui.jsx`) y ya viene compilado en `js/app.bundle.js`.
  Solo si cambia algo dentro de `src/`: instale Node.js, ejecute `npm install` y luego `npm run build`.
- Textos de la página: `js/contenido.js`.

## Asistente (`js/config.js`)
- `CONFIG_ASISTENTE.respuestas = false` -> el asistente todavía NO responde (avisa que está en entrenamiento). Es lo que se usa por ahora.
- `true` -> usa reglas de palabras clave de `js/asistente.js` (no es un modelo entrenado).
- Avatar, uniforme, zoom de cámara y voz: también en `js/config.js`. Sin clave usa la voz femenina en español del navegador.

## Imágenes
Todo el sitio usa `.jpg`. Los nombres están definidos en `img/LEEME.txt`: reemplace el archivo con el mismo nombre y listo.

## Novedades v11
- **Avatar animado 3D** (asistente dental estilo caricatura, creado con código: `src/toon/toon.js`). Funciona incluso abriendo `index.html` con doble clic. Para volver al modelo realista: `estilo: 'realista'` en `js/config.js` (requiere `iniciar.bat`). Color del uniforme: `uniforme` en `js/config.js`.
- Cambio de pantalla con deslizamiento, píldora deslizante en el menú, desvanecido progresivo al hacer scroll, burbujas de fondo, luz que sigue al cursor y brillo en tarjetas (`src/efectos.jsx`, `css/styles.css`). Con "reducir movimiento" del sistema todo se desactiva.
- Recompilar tras editar `src/`: `npm run build`.

## v13 · Personaje desde tu archivo .glb
- `avatars/asistente.glb` (VRoid) se carga y anima con `src/toon/vrm.js`: boca A-I-U-E-O sincronizada con la voz, parpadeo, expresiones y mirada. Necesita abrir con `iniciar.bat`.
- Si el .glb no carga (o abres con doble clic), se usa el personaje creado con código. Para forzar ese: `modelo: ''` en `js/config.js`.
- Para cambiar de personaje: reemplaza `avatars/asistente.glb` (mismo nombre) por otro .glb/.vrm de VRoid.

## v21 · Saludo con la mano y desvanecido global
- Al entrar, el avatar (GLB) saluda con la mano abierta; la cámara se aleja un momento para que se vea y vuelve. Ajustes en `CONFIG_AVATAR`: `opc.saludoZoom`, `saludoPan`, `saludoY`, `saludoA`, `saludoAy`, `saludoMano`.
- Toda la página se desvanece al subir/bajar (velos `.vela` arriba y abajo, ligados al scroll) además del desvanecido por bloque.

## v20 · Portada
- La foto del centro se quitó: ahora `assets/img/hero.jpg` cubre todo el recuadro de la portada (semitransparente, con zoom lento). El `hero.jpg` incluido es un fondo de ejemplo; reemplázalo por tu foto (mejor horizontal, ~1920×700).
- Letra de títulos: `--fuente-titulo` en `css/styles.css` (Playfair Display, se carga desde Google Fonts; sin internet usa Georgia). Se aplica al título de la portada y al nombre de la clínica.

## v33 · Clasificador con los 3 modelos del profe
- `modelo/` contiene la exportación `modelo_2026-11-05T23-44-22-582Z` (dominio, tema, intencion + vocabulario.json + metadata.json).
- `js/clasificador.js` carga los 3 modelos (TensorFlow.js) y `js/asistente.js` usa dominio/tema/intención para elegir la sección (servicios, casos, nosotros, contacto, legal).
- Mapeo: tratamientos→servicios · equipo_clinico e instalaciones_tecnologia→nosotros · casos_clinicos→casos · contacto→contacto · privacidad_legal→legal.
- Abrir la página con `iniciar.bat` (servidor HTTP), no con doble clic en index.html, para que cargue `modelo/`.
- TensorFlow.js: se toma de `vendor/tfjs/tf.min.js` si existe; si no, de la CDN (requiere internet). Para uso sin internet, copiar `node_modules/@tensorflow/tfjs/dist/tf.min.js` a `vendor/tfjs/`.
- Precisión en las 100 preguntas de prueba: dominio 84 %, tema 68 %, intención 82 %.

## v34 · Puntos débiles
- Fuera de tema: `clasificador.js` calcula la `cobertura` (parte de la frase que el modelo conoce); si es < 60 % se marca `fueraDeTema` y el asistente responde con una orientación en lugar de fiarse del modelo.
- Agendar cita: `asistente.js` detecta por palabras clave (cita, agendar, apartar, reservar, reprogramar, cancelar, valoración/consulta + verbo) además del modelo de intención.
- Dataset ampliado (`dataset_v2_ampliado.csv`, 1 262 filas, mismo formato que dataset_v2.csv) con más ejemplos de agendar, instalaciones, equipo clínico y tratamientos. Hay que volver a entrenar con él para mejorar el modelo.

## v35 · Correcciones tras pruebas y limpieza
- `Asistente.corregir()` corrige faltas de ortografía y evita que «en qué casos se usa…» se tome como casos clínicos.
- Palabras de uso diario → servicio (`SINON` en `js/asistente.js`); instalaciones/consultorio muestran las fotos de la clínica; «precios» orienta a la valoración.
- Fuera de tema más estricto (umbral 80 % de cobertura + palabras propias de la clínica).
- Limpieza: se quitó la carpeta `entrenamiento/` (el entrenamiento se hace con `entrenamiento_v3_dos_fuentes`, fuera de la página), `salida_dataset/`, `img_originales_baja_resolucion/` y `modelo/reporte_evaluacion.json`.
- Se conserva `extraer_dataset.bat/.py` (con `src/`, `package.json` y este README) por si hay que volver a generar `inventario_contenido.csv`.

## Entrenamiento (fuera de la página)
Proceso del profe `entrenamiento_v3_dos_fuentes`: 01_inicializar → copiar `inventario_contenido.csv` y `dataset_v2.csv` a `salida_dataset` → 02_preparar → (vaciar `modelo_web`) → 03_entrenar → 04_exportar. Del `modelo_exportado/modelo_<fecha>/` se copian `dominio/`, `tema/`, `intencion/`, `vocabulario.json` y `metadata.json` a `modelo/` de la página.
