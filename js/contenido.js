/* ============================================================
   CONTENIDO DE LA PÁGINA  (edite aquí textos e imágenes)
   - Las fotos van en img/servicios/ y img/casos/ (nombres sin acentos).
   - "claves": palabras con las que el asistente reconoce cada tema (sin acentos).
   ============================================================ */
const proc = (titulo, descripcion, imagen) => ({ titulo, descripcion, imagen: 'img/servicios/' + imagen });
const ben  = (texto, icono) => ({ texto, icono });

const SITIO = {
  servicios: [
    { id: 'rehabilitacion', titulo: 'Rehabilitación oral', icono: 'tooth', corta: 'Recupera la función y apariencia de tus dientes.',
      descripcion: 'Cuidado, mantenimiento y restauración de piezas dentales (preventivo, estético y avanzado).',
      imagen: 'img/servicios/rehabilitacion-completa.jpg',
      beneficios: [ben('Apoya el cuidado bucal', 'shield'), ben('Contribuye a una mejor apariencia', 'smile'), ben('Ayuda a mantener la función dental', 'tooth')],
      procedimientos: [proc('Limpieza dental', 'Higiene profesional.', 'limpieza-dental.jpg'), proc('Blanqueamiento', 'Mejora el color.', 'blanqueamiento-dental.jpg'),
                       proc('Resinas premium', 'Alta estética.', 'resinas-premium.jpg'), proc('Resinas', 'Convencional.', 'resinas-dentales.jpg')],
      claves: ['rehabilitacion', 'limpieza', 'blanqueamiento', 'resina', 'resinas'],
      respuesta: 'Sí, ofrecemos rehabilitación oral: cuidado, mantenimiento y restauración de piezas dentales, desde lo preventivo hasta lo avanzado. Incluye limpieza dental, blanqueamiento y resinas.',
      relacionados: ['caso-05', 'caso-01'] },
    { id: 'implantes', titulo: 'Implantes dentales', icono: 'implant', corta: 'Soluciones para reemplazar piezas dentales ausentes.',
      descripcion: 'Raíces artificiales de titanio biocompatible para recuperar la función masticatoria.',
      imagen: 'img/servicios/implantes-dentales.jpg',
      beneficios: [ben('Aspecto natural', 'sparkle'), ben('Evita pérdida ósea', 'shield'), ben('Alta durabilidad', 'clock')],
      procedimientos: [proc('Implante individual', 'Sustitución fija.', 'implante-individual.jpg'), proc('Puente', 'Varias piezas.', 'puente-sobre-implantes.jpg'),
                       proc('Regeneración ósea', 'Preparación previa.', 'regeneracion-osea.jpg'), proc('Rehabilitación', 'Arcada completa.', 'rehabilitacion-procedimiento.jpg')],
      claves: ['implante', 'implantes', 'titanio', 'puente', 'regeneracion'],
      respuesta: 'Sí, contamos con implantes dentales: raíces artificiales de titanio biocompatible que recuperan la función masticatoria. Ofrecemos implante individual, puente sobre implantes, regeneración ósea y rehabilitación de arcada completa.',
      relacionados: ['caso-05', 'doctora'] },
    { id: 'estetica', titulo: 'Estética dental', icono: 'sparkle', corta: 'Mejora la apariencia de tu sonrisa.',
      descripcion: 'Tratamientos avanzados para armonizar la forma y coloración de tus dientes.',
      imagen: 'img/servicios/estetica-dental.jpg',
      beneficios: [ben('Sonrisa brillante', 'sparkle'), ben('Mayor confianza', 'smile'), ben('Corrección visual', 'check')],
      procedimientos: [proc('Carillas', 'Láminas estéticas.', 'carillas-porcelana.jpg'), proc('Blanqueamiento LED', 'Aclaramiento rápido.', 'blanqueamiento-led.jpg'),
                       proc('Diseño digital', 'Planificación previa.', 'diseno-sonrisa-digital.jpg'), proc('Contorneado', 'Bordes regulares.', 'contorneado-dental.jpg')],
      claves: ['estetica', 'carilla', 'carillas', 'sonrisa', 'contorneado', 'led', 'diseno'],
      respuesta: 'Sí, en estética dental armonizamos la forma y el color de tus dientes con carillas, blanqueamiento LED, diseño digital de sonrisa y contorneado dental.',
      relacionados: ['caso-02', 'caso-01'] },
    { id: 'ortodoncia', titulo: 'Ortodoncia', icono: 'braces', corta: 'Tratamientos para alinear tus dientes.', descripcion: 'Corrección de la posición de los dientes y de la mordida con aparatología fija, con valoración inicial y controles periódicos para guiar el movimiento.', imagen: 'img/servicios/ortodoncia.jpg', beneficios: [ben('Dientes alineados', 'smile'), ben('Mejor mordida', 'check'), ben('Higiene más sencilla', 'shield')], procedimientos: [proc('Brackets metálicos', 'Aparatología fija para alinear los dientes y corregir la mordida.', 'ortodoncia-brackets.jpg'), proc('Alineadores transparentes', 'Placas removibles y discretas que mueven los dientes por etapas.', 'ortodoncia-alineadores.jpg'), proc('Retenedores', 'Mantienen los dientes en su nueva posición al terminar el tratamiento.', 'ortodoncia-retenedores.jpg')], claves: ['ortodoncia', 'brackets', 'frenos', 'alinear'], respuesta: 'Contamos con ortodoncia para alinear tus dientes.', relacionados: ['caso-03'] },
    { id: 'periodoncia', titulo: 'Periodoncia', icono: 'gum', corta: 'Cuidado de encías y tejidos de soporte.', descripcion: 'Diagnóstico y tratamiento de las encías y de los tejidos que sostienen los dientes: control de placa, raspado y alisado radicular y mantenimiento periodontal.', imagen: 'img/servicios/periodoncia.jpg', beneficios: [ben('Encías sanas', 'shield'), ben('Previene la pérdida dental', 'tooth'), ben('Menos sangrado', 'check')], procedimientos: [proc('Raspado y alisado radicular', 'Limpieza profunda bajo la encía para eliminar sarro y bacterias.', 'periodoncia-raspado.jpg'), proc('Mantenimiento periodontal', 'Revisiones y limpiezas periódicas para conservar encías sanas.', 'periodoncia-mantenimiento.jpg')], claves: ['periodoncia', 'encia', 'encias', 'sarro'], respuesta: 'Atendemos el cuidado de encías y tejidos de soporte.', relacionados: ['caso-04'] },
    { id: 'operatoria', titulo: 'Operatoria dental', icono: 'magnify', corta: 'Limpieza, blanqueamiento y restauraciones.', descripcion: 'Procedimientos para conservar la salud de tus dientes y reparar los daños leves: limpieza profesional, blanqueamiento y restauraciones con resina.', imagen: 'img/servicios/operatoria-dental.jpg', beneficios: [ben('Previene caries', 'shield'), ben('Restaura la forma del diente', 'tooth'), ben('Resultado estético', 'sparkle')], procedimientos: [proc('Limpieza dental', 'Higiene profesional.', 'limpieza-dental.jpg'), proc('Blanqueamiento', 'Mejora el color.', 'blanqueamiento-dental.jpg'), proc('Resinas', 'Restauración estética.', 'resinas-dentales.jpg')], claves: ['operatoria', 'caries'], respuesta: 'Ofrecemos limpieza, blanqueamiento y restauraciones.', relacionados: ['rehabilitacion'] },
    { id: 'protesis', titulo: 'Prótesis dentales', icono: 'denture', corta: 'Soluciones removibles para recuperar tu sonrisa.', descripcion: 'Prótesis dentales removibles que reponen una o varias piezas ausentes para recuperar la masticación, el habla y la apariencia de tu sonrisa.', imagen: 'img/servicios/protesis-dental.jpg', beneficios: [ben('Recupera la masticación', 'tooth'), ben('Mejora la apariencia', 'smile'), ben('Se ajusta a tu caso', 'check')], procedimientos: [proc('Prótesis parcial removible', 'Repone algunas piezas ausentes y se retira para su limpieza.', 'protesis-parcial.jpg'), proc('Prótesis total', 'Repone todas las piezas de una arcada cuando no queda ninguna.', 'protesis-total.jpg')], claves: ['protesis', 'dentadura'], respuesta: 'Contamos con prótesis dentales removibles.', relacionados: ['caso-05'] },
    { id: 'otros', titulo: 'Otros procedimientos', icono: 'tools', corta: 'Tratamientos complementarios según tu necesidad.', descripcion: 'Tratamientos complementarios que se indican después de la valoración, como endodoncia (tratamiento de conductos) y extracciones.', imagen: 'img/servicios/otros-procedimientos.jpg', beneficios: [ben('Alivia el dolor', 'check'), ben('Conserva la pieza dental cuando es posible', 'tooth'), ben('Indicado tras valoración', 'shield')], procedimientos: [proc('Endodoncia', 'Tratamiento de conductos para salvar una pieza con infección o dolor intenso.', 'otros-endodoncia.jpg'), proc('Extracción dental', 'Retiro de una pieza que no puede conservarse, con anestesia local.', 'otros-extraccion.jpg')], claves: ['endodoncia', 'extraccion', 'conductos'], respuesta: 'Ofrecemos tratamientos complementarios según tu necesidad.', relacionados: ['doctora'] }
  ],

  casos: [
    { id: 'caso-01', numero: '01', area: 'ESTÉTICA DENTAL', categoria: 'Otros casos', titulo: 'Blanqueamiento Dental',
      resumen: 'Evaluación profesional para pacientes con pigmentación amarillenta por café o té. Se revisa el estado del esmalte y encías.',
      tratamiento: 'Procedimiento clínico controlado para reducir la sensibilidad y aclarar el tono dental.',
      fases: [['Evaluación', 'Valoración del color dental'], ['Tratamiento', 'Procedimiento profesional'], ['Seguimiento', 'Cuidados posteriores']],
      claves: ['blanqueamiento', 'manchas', 'cafe', 'amarillo', 'amarillentos'], respuesta: 'Este es nuestro caso de blanqueamiento dental: evaluación del esmalte y encías, y un procedimiento controlado para aclarar el tono reduciendo la sensibilidad.', relacionados: ['estetica', 'caso-02'] },
    { id: 'caso-02', numero: '02', area: 'ALTA ESTÉTICA', categoria: 'Diseño de sonrisa', titulo: 'Diseño de Sonrisa con Carillas Cerámicas',
      resumen: 'Solución para espacios interdentales e irregularidades en los bordes.',
      tratamiento: 'Análisis de proporciones dentales y colocación de carillas de disilicato de litio.',
      fases: [['Planeación', 'Escaneo y Visagismo Facial'], ['Mock-Up', 'Prueba Estética en Boca'], ['Restauración', 'Carillas Cerámicas']],
      claves: ['carillas', 'ceramicas', 'sonrisa', 'espacios', 'visagismo', 'disilicato'], respuesta: 'Este es un caso de diseño de sonrisa con carillas cerámicas de disilicato de litio, con escaneo, visagismo facial y prueba estética en boca.', relacionados: ['estetica', 'caso-01'] },
    { id: 'caso-03', numero: '03', area: 'ORTODONCIA', categoria: 'Ortodoncia', titulo: 'Ortodoncia de Autoligado Pasivo',
      resumen: 'Corrección de apiñamiento dental severo y alteración de mordida.',
      tratamiento: 'Aparatología de autoligado pasivo y controles periódicos para guiar el movimiento.',
      fases: [['Valoración', 'Evaluación y Diagnóstico'], ['Tratamiento', 'Alineación Dental'], ['Seguimiento', 'Control y Retención']],
      claves: ['ortodoncia', 'brackets', 'autoligado', 'apinamiento', 'mordida'], respuesta: 'Este es un caso de ortodoncia de autoligado pasivo para corregir apiñamiento severo y alteración de mordida, con controles periódicos.', relacionados: ['ortodoncia', 'doctora'] },
    { id: 'caso-04', numero: '04', area: 'SALUD DE ENCÍAS', categoria: 'Otros casos', titulo: 'Rehabilitación Periodontal y Plastia Gingival',
      resumen: 'Atención a pacientes con sangrado gingival y alteraciones en el contorno de encías.',
      tratamiento: 'Control de placa, raspado y alisado radicular, valorando plastia gingival.',
      fases: [['Diagnóstico', 'Periodontograma Clínico'], ['Tratamiento', 'Raspado y Alisado Radicular'], ['Seguimiento', 'Mantenimiento Periodontal']],
      claves: ['encias', 'sangrado', 'periodontal', 'plastia', 'gingival', 'raspado'], respuesta: 'Este es un caso de rehabilitación periodontal: control de placa, raspado y alisado radicular, valorando plastia gingival.', relacionados: ['periodoncia', 'doctora'] },
    { id: 'caso-05', numero: '05', area: 'FUNCIÓN Y PRÓTESIS', categoria: 'Rehabilitación oral', titulo: 'Rehabilitación Oral Integral Libre de Metal',
      resumen: 'Pacientes con bruxismo, desgaste dental severo y restauraciones antiguas.',
      tratamiento: 'Restablecimiento oclusal mediante coronas de zirconia, incrustaciones y guardas oclusales.',
      fases: [['Diagnóstico', 'Evaluación y Planificación'], ['Tratamiento', 'Restauración y Adaptación'], ['Seguimiento', 'Restauración Definitiva']],
      claves: ['bruxismo', 'rechino', 'zirconia', 'desgaste', 'coronas', 'incrustaciones', 'guarda', 'oclusal'], respuesta: 'Este es un caso de rehabilitación oral integral libre de metal para bruxismo y desgaste severo, con coronas de zirconia, incrustaciones y guardas oclusales.', relacionados: ['rehabilitacion', 'implantes'] }
  ],

  doctora: {
    id: 'doctora', titulo: 'Dra. Jaanett', subtitulo: 'Cirujano Dentista · Odontología Integral Estética',
    descripcion: 'Mi compromiso es brindar una atención odontológica profesional, cercana y personalizada, orientada al cuidado, restauración y rehabilitación de la sonrisa de cada paciente.',
    credenciales: [['cap', 'Egresada de la Universidad Autónoma Benito Juárez de Oaxaca (UABJO)'], ['cert', 'Cédula profesional 9240210 (Registrada en 2015)'], ['pin', 'Práctica profesional en Oaxaca de Juárez, Oaxaca']],
    filosofia: 'Cada paciente es único. Por ello, la atención comienza con una valoración profesional, una explicación clara de las alternativas de tratamiento y un seguimiento continuo para lograr resultados funcionales y estéticos.',
    claves: ['doctora', 'dentista', 'janet', 'jaanett', 'cedula', 'quien', 'estudio', 'universidad', 'filosofia'],
    respuesta: 'La Dra. Jaanett es Cirujano Dentista especialista en odontología integral estética, egresada de la UABJO, con práctica profesional en Oaxaca de Juárez.', relacionados: ['contacto', 'caso-02'] },

  contacto: {
    id: 'contacto', titulo: 'Contacto', ubicacion: 'Av. Independencia 512, Centro Histórico, 68000 Oaxaca de Juárez, Oaxaca',
    mapaEmbed: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3761.8505805166947!2d-99.06421392324715!3d19.462007981823803!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x85d1fba1933eec83%3A0x30b9a0b2b63fb2e7!2sTecNM%20Instituto%20Tecnol%C3%B3gico%20de%20Gustavo%20A.%20Madero!5e0!3m2!1ses!2smx!4v1794358875303!5m2!1ses!2smx',
    mapaEnlace: 'TecNM Instituto Tecnológico de Gustavo A. Madero',
    mapaConsulta: 'Av. Independencia 512, Centro Histórico, 68000 Oaxaca de Juárez, Oaxaca, México',
    telefono: '951 555 0147', correo: 'contacto@clinicadrajanet.mx',
    horarios: 'Lunes a viernes de 9:00 a 19:00 h · Sábados de 9:00 a 14:00 h',
    redes: [{ n: 'fb', nombre: 'Facebook', usuario: '@clinicadrajanet', url: 'https://facebook.com/clinicadrajanet' },
            { n: 'ig', nombre: 'Instagram', usuario: '@clinicadrajanet', url: 'https://instagram.com/clinicadrajanet' },
            { n: 'yt', nombre: 'YouTube', usuario: 'Clínica Dra. Janet', url: 'https://youtube.com/@clinicadrajanet' },
            { n: 'wa', nombre: 'WhatsApp', usuario: '951 555 0147', url: 'https://wa.me/529515550147' }],
    claves: ['donde', 'ubicacion', 'ubicados', 'direccion', 'horario', 'telefono', 'whatsapp', 'correo', 'cita', 'agendar', 'contacto', 'redes', 'instagram', 'facebook'],
    respuesta: 'Estamos en Av. Independencia 512, Centro Histórico, Oaxaca de Juárez. Atendemos de lunes a viernes de 9:00 a 19:00 h y los sábados de 9:00 a 14:00 h. Puedes llamar o escribir por WhatsApp al 951 555 0147. Te muestro los datos para contactarnos y agendar tu cita.', relacionados: ['doctora'] },

  legal: [
    { id: 'privacidad', titulo: 'Aviso de privacidad', texto: 'La Clínica Dra. Janet, con domicilio en Av. Independencia 512, Centro Histórico, Oaxaca de Juárez, Oaxaca, es responsable del tratamiento de tus datos personales.\n\nLos datos que nos proporcionas (nombre, teléfono, correo y mensaje) se utilizan únicamente para responder tus consultas, agendar y dar seguimiento a tus citas y brindarte información sobre nuestros servicios.\n\nNo compartimos tus datos con terceros sin tu consentimiento, salvo cuando la ley lo exija. Puedes ejercer tus derechos de acceso, rectificación, cancelación y oposición escribiendo a contacto@clinicadrajanet.mx.\n\nCualquier cambio a este aviso se publicará en esta misma página.' },
    { id: 'terminos', titulo: 'Términos y condiciones', texto: 'El contenido de este sitio tiene fines informativos y no sustituye una valoración odontológica. El diagnóstico y el plan de tratamiento se definen únicamente en consulta.\n\nLas imágenes de casos clínicos son ilustrativas; los resultados varían según cada paciente.\n\nLas citas se confirman por teléfono o WhatsApp. Para reprogramar o cancelar, pedimos avisar con al menos 24 horas de anticipación.\n\nLa Clínica Dra. Janet puede actualizar estos términos y la información del sitio en cualquier momento.' },
    { id: 'cookies', titulo: 'Política de cookies', texto: 'Este sitio utiliza almacenamiento local del navegador únicamente para recordar tus preferencias, como el modo claro u oscuro.\n\nNo utilizamos cookies publicitarias ni de rastreo. Puedes borrar estos datos en cualquier momento desde la configuración de tu navegador.' }
  ]
};

// Convierte las fases [etapa, título] en objetos con su imagen: img/casos/caso-0N-fase-K.jpg
SITIO.casos.forEach(c => { c.fases = c.fases.map(([etapa, titulo], i) => ({ etapa, titulo, imagen: `img/casos/caso-${c.numero}-fase-${i + 1}.jpg` })); });
SITIO.casos.forEach(c => { c.portada = `img/casos/caso-${c.numero}.jpg`; });
