/* ============================================================
   ASISTENTE · entiende la pregunta y decide qué mostrar
   ENTENDER (palabras) -> DECIDIR (tema) -> ACTUAR (la página muestra la respuesta)
   Usa las "claves" de js/contenido.js. Más adelante puede reemplazarse por un modelo de IA.
   ============================================================ */
const OTRO_TEMA = 'Eso queda fuera de lo que puedo responder, pero con gusto te ayudo con la clínica: servicios, casos clínicos, información de la doctora y de las instalaciones, contacto y citas, o el aviso de privacidad. ¿Qué te interesa?';
// palabras de uso diario → servicio de la página
const SINON = {chueco: 'ortodoncia', chueca: 'ortodoncia', torcido: 'ortodoncia', torcida: 'ortodoncia', enderezar: 'ortodoncia', apinado: 'ortodoncia', apinada: 'ortodoncia', apinamiento: 'ortodoncia', alineador: 'ortodoncia', alineadores: 'ortodoncia', alinear: 'ortodoncia', alineacion: 'ortodoncia', separado: 'ortodoncia', separada: 'ortodoncia', montado: 'ortodoncia', montada: 'ortodoncia', brackets: 'ortodoncia', bracket: 'ortodoncia', frenos: 'ortodoncia', freno: 'ortodoncia', braces: 'ortodoncia', retenedor: 'ortodoncia', retenedores: 'ortodoncia', mordida: 'ortodoncia', cruzada: 'ortodoncia', ortodoncista: 'ortodoncia', sangran: 'periodoncia', sangrado: 'periodoncia', sangra: 'periodoncia', sangrar: 'periodoncia', aliento: 'periodoncia', halitosis: 'periodoncia', inflamada: 'periodoncia', inflamado: 'periodoncia', encia: 'periodoncia', encias: 'periodoncia', gingivitis: 'periodoncia', piorrea: 'periodoncia', flojo: 'periodoncia', floja: 'periodoncia', mueve: 'periodoncia', mueven: 'periodoncia', movilidad: 'periodoncia', retraccion: 'periodoncia', periodontitis: 'periodoncia', periodontal: 'periodoncia', amarillo: 'rehabilitacion', amarilla: 'rehabilitacion', amarillento: 'rehabilitacion', amarillentos: 'rehabilitacion', amarillentas: 'rehabilitacion', mancha: 'rehabilitacion', manchas: 'rehabilitacion', manchado: 'rehabilitacion', manchada: 'rehabilitacion', oscuro: 'rehabilitacion', oscuros: 'rehabilitacion', blanquear: 'rehabilitacion', bruxismo: 'rehabilitacion', rechino: 'rehabilitacion', rechinar: 'rehabilitacion', rechinan: 'rehabilitacion', apretar: 'rehabilitacion', apreto: 'rehabilitacion', desgaste: 'rehabilitacion', desgastado: 'rehabilitacion', desgastados: 'rehabilitacion', carilla: 'estetica', carillas: 'estetica', feo: 'estetica', feos: 'estetica', fea: 'estetica', contorneado: 'estetica', sensibilidad: 'operatoria', sensible: 'operatoria', sensibles: 'operatoria', caries: 'operatoria', carie: 'operatoria', picado: 'operatoria', picada: 'operatoria', picadura: 'operatoria', picaduras: 'operatoria', empaste: 'operatoria', empastes: 'operatoria', resina: 'operatoria', resinas: 'operatoria', obturacion: 'operatoria', frio: 'operatoria', caliente: 'operatoria', astillado: 'operatoria', astillada: 'operatoria', despostillado: 'operatoria', despostillada: 'operatoria', roto: 'operatoria', rota: 'operatoria', quebrado: 'operatoria', rompio: 'operatoria', rompi: 'operatoria', rompe: 'operatoria', quebro: 'operatoria', quebre: 'operatoria', partio: 'operatoria', parti: 'operatoria', desportille: 'operatoria', despostille: 'operatoria', quebrada: 'operatoria', fracturado: 'operatoria', fracturada: 'operatoria', dentadura: 'protesis', dentaduras: 'protesis', postizo: 'protesis', postizos: 'protesis', postiza: 'protesis', removible: 'protesis', removibles: 'protesis', protesis: 'protesis', implante: 'implantes', implantes: 'implantes', falta: 'implantes', faltan: 'implantes', perdi: 'implantes', perdio: 'implantes', hueco: 'implantes', huecos: 'implantes', desdentado: 'implantes', extraje: 'implantes', titanio: 'implantes', dolor: 'otros', duele: 'otros', duelen: 'otros', doler: 'otros', doliendo: 'otros', muela: 'otros', muelas: 'otros', nervio: 'otros', nervios: 'otros', conducto: 'otros', conductos: 'otros', endodoncia: 'otros', extraer: 'otros', extraccion: 'otros', extracciones: 'otros', sacar: 'otros', sacarme: 'otros', cordal: 'otros', cordales: 'otros', juicio: 'otros', infeccion: 'otros', infectado: 'otros', absceso: 'otros', abceso: 'otros', flemon: 'otros', hinchado: 'otros', hinchada: 'otros', hinchazon: 'otros', inflamacion: 'otros', urgencia: 'otros', urgencias: 'otros', sarro: 'periodoncia', limpieza: 'operatoria'};
// forma base de una palabra (plurales) para buscarla en SINON
Object.assign(SINON, {blancos: 'rehabilitacion', blancas: 'rehabilitacion', blanco: 'rehabilitacion', blanqueamiento: 'rehabilitacion', blanqueo: 'rehabilitacion', pigmentacion: 'rehabilitacion', pigmentados: 'rehabilitacion', negros: 'rehabilitacion', grises: 'rehabilitacion', cafe: 'rehabilitacion', cafes: 'rehabilitacion', sarrosos: 'periodoncia', sarrosa: 'periodoncia', limpiar: 'rehabilitacion', limpiarme: 'rehabilitacion', higiene: 'rehabilitacion',
  sonreir: 'estetica', sonrisa: 'estetica', armonizar: 'estetica', forma: 'estetica', tamano: 'estetica', pequenos: 'estetica', chiquitos: 'estetica', cortos: 'estetica', diseno: 'estetica', estetico: 'estetica', estetica: 'estetica', verguenza: 'estetica', complejo: 'estetica',
  cayo: 'implantes', cayeron: 'implantes', caido: 'implantes', caida: 'implantes', ausente: 'implantes', ausentes: 'implantes', reponer: 'implantes', reemplazar: 'implantes', sustituir: 'implantes', perdida: 'implantes', perdidos: 'implantes', perdiendo: 'implantes', hueso: 'implantes',
  puente: 'implantes', corona: 'protesis', coronas: 'protesis', placa: 'protesis', placas: 'protesis', parcial: 'protesis', total: 'protesis', masticar: 'protesis', comer: 'protesis', mastico: 'protesis', sin: 'protesis',
  amoxicilina: 'otros', analgesico: 'otros', adolorida: 'otros', adolorido: 'otros', punzada: 'otros', punzadas: 'otros', pulsa: 'otros', molestia: 'otros', molestias: 'otros', sufro: 'otros', aguanto: 'otros', pus: 'otros', fiebre: 'otros', cara: 'otros', sacaron: 'otros', arrancar: 'otros', endodoncias: 'otros', pulpitis: 'otros', fistula: 'otros',
  sangrando: 'periodoncia', sangran: 'periodoncia', sarro: 'periodoncia', mal: 'periodoncia', olor: 'periodoncia', rojas: 'periodoncia', rojo: 'periodoncia', rojizas: 'periodoncia', hinchadas: 'periodoncia', retrocediendo: 'periodoncia', retroceden: 'periodoncia', largos: 'periodoncia', tambalean: 'periodoncia', tambalea: 'periodoncia', bailan: 'periodoncia', cepillar: 'periodoncia', cepillo: 'periodoncia', hilo: 'periodoncia', dental: 'rehabilitacion'});
delete SINON.sin; delete SINON.mal; delete SINON.dental; delete SINON.total; delete SINON.forma; delete SINON.cara; delete SINON.comer; delete SINON.cafe; delete SINON.cafes; delete SINON.hilo; delete SINON.sonrisa; delete SINON.hueso; delete SINON.sonreir; delete SINON.complejo; delete SINON.placa; delete SINON.placas; delete SINON.pus; delete SINON.fiebre; delete SINON.rojo; delete SINON.rojas;
// busca la palabra tal cual y en sus formas base (plurales y género: amarillos/amarilla → amarillo)
const sinon = w => { for (const f of [w, w.replace(/es$/, ''), w.replace(/s$/, ''), w.replace(/os$/, 'o'), w.replace(/as$/, 'a'), w.replace(/a$/, 'o'), w.replace(/o$/, 'a')]) if (SINON[f]) return SINON[f]; };
const Asistente = {
  // minúsculas, sin acentos ni signos
  normalizar(t) {
    return t.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9ñ ]/g, ' ').replace(/\s+/g, ' ').trim();
  },

  // Corrige faltas de ortografía comunes (kiero ajendar una sita → quiero agendar una cita) comparando con las palabras que conoce el sitio y el modelo
  corregir(texto) {
    const extras = ['quiero', 'agendar', 'cita', 'citas', 'precio', 'precios', 'costo', 'costos', 'consulta', 'valoracion', 'reprogramar', 'cancelar', 'apartar', 'reservar', 'doctora', 'consultorio', 'instalaciones', 'ortodoncia', 'implantes', 'limpieza', 'blanqueamiento', 'carillas', 'resinas', 'brackets'];
    if (!this._lex) {
      const claves = [...SITIO.servicios, ...SITIO.casos, SITIO.doctora, SITIO.contacto].flatMap(x => x.claves || []);
      this._claves = new Set([...extras, ...claves]);
      this._lex = new Set([...extras, ...claves, ...Object.keys(SINON)]);
    }
    const lex = new Set([...this._lex, ...((window.Clasificador && Clasificador.vocabulario) || [])]);
    const dist = (a, b, max) => { if (Math.abs(a.length - b.length) > max) return max + 1; let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
      for (let i = 1; i <= a.length; i++) { const cur = [i]; for (let j = 1; j <= b.length; j++) cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)); prev = cur; } return prev[b.length]; };
    const variantes = w => [...new Set([w, w.replace(/^k(?=[ie])/, 'qu').replace(/k/g, 'c'), w.replace(/j(?=[ei])/g, 'g'), w.replace(/s(?=[ei])/g, 'c'), w.replace(/z(?=[ei])/g, 'c'), w.replace(/v/g, 'b'), w.replace(/b/g, 'v'), w.replace(/^k(?=[ie])/, 'qu').replace(/j(?=[ei])/g, 'g').replace(/s(?=[ei])/g, 'c')])];
    const base = this.normalizar(texto).replace(/\ben (que|cuales) casos?\b/g, 'cuando');   // "en qué casos se usa X" no es pedir casos clínicos
    const hablaBoca = /(dient|muel|encia|boca|sonri|sonre|dental|dentist|labio|mandibul|caries|sarro|aliento)/.test(base);
    const soloSinon = k => !!SINON[k] && !this._claves.has(k);
    return base.split(' ').filter(Boolean).map(w => {
      if (lex.has(w) || w.length < 4 || sinon(w)) return w;
      const vs = variantes(w); const hit = vs.find(v => lex.has(v)); if (hit) return (soloSinon(hit) && !hablaBoca && hit !== w) ? w : hit;
      const max = w.length <= 4 ? 0 : w.length >= 7 ? 2 : 1; let mejor = null, d0 = max + 1;
      for (const v of vs) for (const c of lex) { if (c[0] !== v[0] && c[0] !== w[0]) continue; const d = dist(v, c, max); if (d < d0) { d0 = d; mejor = c; } }
      if (mejor && d0 <= max && soloSinon(mejor) && !hablaBoca) return w;
      return mejor && d0 <= max ? mejor : w;
    }).join(' ');
  },

  // Busca un elemento del sitio por su id y dice a qué área pertenece
  buscar(id) {
    let item = SITIO.servicios.find(x => x.id === id);   if (item) return { area: 'servicios', item };
    item = SITIO.casos.find(x => x.id === id);           if (item) return { area: 'casos', item };
    if (id === 'doctora')  return { area: 'nosotros', item: SITIO.doctora };
    if (id === 'contacto') return { area: 'contacto', item: SITIO.contacto };
    return null;
  },

  // Devuelve { area, item?, todos?, texto }  ·  Siempre contesta algo.
  // "pista" (opcional) = resultado de la red neuronal { dominio, confianza }: se usa cuando las palabras clave no bastan.
  responder(texto, pista) {
    const q = this.corregir(texto).split(' ').filter(Boolean);
    const tiene = (...palabras) => palabras.some(p => q.includes(p) || (p.length > 3 && (q.includes(p + 's') || q.includes(p.replace(/s$/, '')))));
    const DEBILES = new Set(['quien', 'donde', 'que', 'como', 'cuando']), ancla = tiene('doctora', 'dra', 'doctor', 'clinica', 'consultorio', 'dentista', 'janet', 'ubicacion', 'direccion');
    const puntos = it => it.claves.reduce((n, c) => n + (q.includes(c) && (!DEBILES.has(c) || ancla) ? 2 : 0), 0);
    const mejor = lista => lista.map(l => ({ ...l, p: puntos(l.item) })).filter(l => l.p > 0).sort((a, b) => b.p - a.p)[0];
    const dominio = pista && pista.dominio && pista.confianza >= .5 ? pista.dominio : null;
    const tema = pista && pista.tema && pista.temaConfianza >= .5 ? pista.tema : null;
    // el modelo de tema dice "de qué trata"; aquí se traduce al servicio de la página que corresponde
    const TEMA_SERVICIO = { implantes: 'implantes', ortodoncia: 'ortodoncia', periodoncia: 'periodoncia', rehabilitacion: 'rehabilitacion', protesis: 'protesis', operatoria: 'operatoria', resinas: 'operatoria',
      blanqueamiento: 'rehabilitacion', limpieza: 'operatoria', carillas: 'estetica', diseno_sonrisa: 'estetica', endodoncia: 'otros' };
    const legal = { area: 'legal', item: SITIO.legal, texto: 'Puedes consultar el aviso de privacidad, los términos y condiciones y la política de cookies en la sección Legal.' };

    // frases frecuentes de varias palabras (no dependen de una sola palabra clave)
    const txt = ' ' + q.join(' ') + ' ';
    const FRASES = [
      [/ (mal|feo) (aliento|olor) /, 'periodoncia'], [/ (me )?(sangran?|sangrando|sangro) (las )?(encias?|al cepillar)/, 'periodoncia'], [/ encias? (rojas?|hinchadas?|inflamadas?|retraidas?|sangran)/, 'periodoncia'],
      [/ (diente|dientes|muelas?) (flojos?|que se mueven|se mueven)/, 'periodoncia'], [/ (se me )?(cayo|cayeron|rompio|quebro|parti|salio) (un|una|el|la|mi) (diente|muela|resina|empaste)/, 'operatoria'],
      [/ (me falta|me faltan|perdi|sin) (un |una |mis |el |la )?(diente|dientes|muela|muelas|dentadura)/, 'implantes'], [/ (dientes?|sonrisa) (torcid|chuec|apin|separad|montad)/, 'ortodoncia'],
      [/ (dientes?|muelas?) (sensibles?|picad|con caries)/, 'operatoria'], [/ (dientes?|sonrisa) (amarill|manchad|oscur|feo|feos|opac)/, 'rehabilitacion'], [/ (dolor|duele|me duele|duelen)/, 'otros'], [/ (quiero|me gustaria|quisiera) (blanquear|aclarar|limpiar)/, 'rehabilitacion'],
      [/ (cambiar|mejorar|arreglar|rehacer) (mi )?(sonrisa|dientes)/, 'estetica']
    ];
    const fr = FRASES.find(([re]) => re.test(txt));
    const svFrase = fr && SITIO.servicios.find(x => x.id === fr[1]);

    if ((tiene('hola', 'buenas', 'buenos', 'buen', 'gracias', 'adios', 'chao', 'bye') || (tiene('hasta') && tiene('luego', 'pronto', 'manana')) || (tiene('nos') && tiene('vemos'))) && q.length <= 6)
      return { area: 'otro', texto: tiene('gracias') ? '¡Con gusto! Si necesitas algo más sobre nuestros servicios, casos clínicos, la doctora o cómo contactarnos, aquí estoy.' : (tiene('adios', 'chao', 'bye', 'hasta', 'vemos')) ? '¡Hasta pronto! Aquí estaré cuando quieras volver a preguntar.' : '¡Hola! Soy el asistente de la Clínica Dra. Janet. ¿Sobre qué servicio te gustaría saber?' };

    // preguntas ajenas a la clínica que contienen palabras "engañosas" (hora, número...)
    if (/ (que hora es|que dia es|dime un numero|que fecha es) /.test(' ' + q.join(' ') + ' ')) return { area: 'servicios', todosServicios: true, texto: OTRO_TEMA };
    // respuestas cortas de cortesía
    if (/^ (ok|okey|okay|vale|perfecto|excelente|genial|entiendo|de acuerdo|muy bien|listo|sale|bueno|claro|entendido|va) $/.test(' ' + q.join(' ') + ' ')) return { area: 'otro', texto: 'Con gusto. ¿Hay algo más en lo que pueda ayudarte con tu sonrisa?' };
    // datos personales / privacidad
    if (/ (datos personales|mis datos|tratan mis datos|mi informacion|proteg\w* (mis )?datos|confidencial)/.test(' ' + q.join(' ') + ' ')) return legal;
    // quiere ir / ser atendido (intención de cita)
    if (/ (ir|asistir|acudir|visitar|pasar|checarme|revisarme|atenderme|verme) (con|al|a ver al|a la|con la|con el) ?(el |la )?(dentista|doctora|doctor|clinica|consultorio)|ir al dentista|hay (lugar|espacio|cupo|disponibilidad|citas)|cupo|lugar para (hoy|manana|el )/.test(' ' + q.join(' ') + ' ')) return { area: 'contacto', item: SITIO.contacto, texto: 'Claro, para ir a la clínica lo mejor es agendar tu cita. Aquí tienes los datos de contacto para confirmar fecha y horario.' };
    // ubicación, cómo llegar, cómo agendar (frases cotidianas)
    if (/ (donde (estan|los encuentro|se ubican|se encuentran|queda|esta la clinica)|en que (colonia|ciudad|zona|calle|estado)|esta en el centro|estacion|hasta que hora|a que hora|como (agendo|agendar|puedo agendar|saco cita|apartar)|me atiendan|atiendan ya|atiendan hoy|cerca de|mandarme su ubicacion|dame (su|tu) (ubicacion|direccion)|como los contacto|los contacto|contactar|contacto con ustedes|forma de contacto|comunicarme)/.test(' ' + q.join(' ') + ' ') && !/(doctora|dra|estudio|graduo)/.test(q.join(' ')))
      return { area: 'contacto', item: SITIO.contacto, texto: SITIO.contacto.respuesta };
    // equipo / quién atiende / datos de la doctora
    if (/ (quien|quienes|con quien) .*(atiend|atender|atenderia|trabaja|trabajan|labora|dentista|doctor|me va)|(ejerc|anos tiene|anos de experiencia|se graduo|graduo|estudio|egreso|universidad|cedula|titulad|especialidad|experiencia|maestria|especializa) /.test(' ' + q.join(' ') + ' ') && !/(clinica|instalacion)/.test(q.join(' ')))
      return { area: 'nosotros', item: SITIO.doctora, texto: SITIO.doctora.respuesta };
    // odontología general, niños
    if (/ (odontologia general|dentista general|odontologo general|ninos|ninas|nino|hijo|hija|bebe|adolescentes|adultos mayores) /.test(' ' + q.join(' ') + ' ') && !/(caso|casos|duele|cuanto|dient|muel|encia|chuec|caries|sangr|blanc|amarill)/.test(q.join(' ')))
      return { area: 'servicios', todosServicios: true, texto: 'Atendemos pacientes de distintas edades y ofrecemos odontología general y especializada. Aquí tienes nuestros servicios; en la valoración la doctora te orienta según cada caso.' };

    // conversación básica y preguntas generales (no dependen de la red neuronal)
    const CHARLA = [
      [/ (quien|que) (eres|sos) | como te llamas | tu nombre /, 'Soy el asistente virtual de la Clínica Dra. Janet. Puedo contarte sobre nuestros servicios, mostrarte casos clínicos, hablarte de la doctora y de las instalaciones, y ayudarte a agendar tu cita.'],
      [/ (que|en que) (puedes|sabes|haces) | en que me (puedes )?ayudar | como (me )?(puedes )?ayudar | para que sirves /, 'Puedo orientarte según lo que sientas o quieras mejorar (por ejemplo dientes manchados, encías que sangran o dientes chuecos), explicarte nuestros servicios, mostrarte casos clínicos, darte horarios y ubicación, y ayudarte a agendar tu cita.'],
      [/ cada cuanto .*(limpi|cepill|revis|ir al dentista|visitar)|(limpiar|cepillar).* (bien|correctamente)|como (me )?(cuido|cepillo|limpio)/, 'Lo recomendable es cepillarte después de cada comida, usar hilo dental una vez al día y acudir a revisión y limpieza profesional aproximadamente cada 6 meses. Si quieres, agenda tu valoración con la doctora.'],
      [/ (puedo|podria|se puede|alcanzo) (ir|llegar|pasar|checarme|atenderme) (hoy|manana|ahorita|ya)|ir hoy | me pueden atender (hoy|ahorita|ya)/, 'Para que te atendamos hoy lo mejor es llamar o escribir por WhatsApp y confirmar disponibilidad. Aquí tienes los datos para agendar una valoración.'],
      [/ como (estas|andas|te va|amaneciste) |^ que tal $/, 'Muy bien, gracias por preguntar. ¿En qué te puedo ayudar hoy con tu sonrisa?'],
      [/ (duele|dolera|dolor) .*(tratamiento|procedimiento|implante|limpieza|ortodoncia|blanqueamiento|extraccion|endodoncia|conductos)| (tratamiento|procedimiento|implante|limpieza|ortodoncia|blanqueamiento|extraccion|endodoncia|conductos) .*(duele|dolera|dolor)/, 'Los procedimientos se realizan con la técnica y la anestesia adecuadas para cuidar tu comodidad. Si te preocupa el dolor, coméntaselo a la doctora en tu valoración y te explica qué esperar.'],
      [/ (cuanto|que tanto) (dura|tarda|demora|tiempo)| (duracion|tiempo) (del|de|de un|de una) (tratamiento|procedimiento|ortodoncia|implante)/, 'La duración depende de cada caso y del tratamiento. En la valoración la doctora revisa tu boca y te da un tiempo estimado y un plan por etapas.'],
      [/ (primera|primer) (cita|consulta|visita) | que (incluye|hacen|pasa) (en )?(la |mi )?(valoracion|consulta|primera)/, 'En la primera cita la doctora revisa tu boca, escucha lo que te preocupa, te explica las opciones de tratamiento y te orienta sobre tiempos y costos. Aquí tienes cómo agendarla.'],
      [/ garantia | (cuanto|que) (dura|duran) (el|los|las) (implante|implantes|resinas?|carillas?|blanqueamiento)/, 'La duración y el cuidado de cada tratamiento dependen del caso y de tus hábitos de higiene. La doctora te explica los detalles en la valoración.']
    ];
    const ch = CHARLA.find(([re]) => re.test(' ' + q.join(' ') + ' '));
    if (ch) {
      const cita = /valoraci|primera|duraci|cuanto|garant/.test(ch[1]) || ch[0].source.includes('primera');
      return cita ? { area: 'contacto', item: SITIO.contacto, texto: ch[1] } : { area: 'otro', texto: ch[1] };
    }

    // síntomas y molestias comunes: se detectan en cualquier parte de la frase (aunque haya palabras en medio)
    const SINTOMAS = [
      ['periodoncia', ['sangr', 'encia', 'sarro', 'mal aliento', 'huele mal', 'huele feo', 'mal olor', 'aliento', 'flojo', 'flojos', 'se mueve', 'se mueven', 'retraid', 'duelen las encias', 'me duele la encia', 'gingivitis', 'periodontitis', 'piorrea'],
        'Encías que sangran o se inflaman, sarro o mal aliento suelen tratarse en Periodoncia, con limpieza profunda (raspado y alisado) y mantenimiento. Te muestro el servicio; la doctora te valora.'],
      ['ortodoncia', ['chuec', 'torcid', 'apinad', 'apin', 'separad', 'bracket', 'freno', 'alinear', 'enderezar', 'mordida', 'encimad', 'montad', 'alineador', 'invisalign', 'retenedor', 'hueco entre', 'espacio entre', 'espacios entre', 'diastema', 'dientes de conejo', 'dientes salidos', 'derechos', 'rectos', 'se montan', 'montan', 'cruzada', 'dientes de enfrente salidos', 'salidos', 'salido', 'dientes montados'],
        'Para dientes chuecos, separados o una mordida desalineada, la opción es la ortodoncia: brackets, alineadores transparentes y retenedores. Te muestro el servicio; la doctora valora cuál te conviene.'],
      ['rehabilitacion', ['amarill', 'manchad', 'mancha', 'oscur', 'pigment', 'blanque', 'blanquear', 'aclarar', 'grisace', 'negros', 'color de mis dientes', 'color de los dientes', 'mas blancos', 'mas blanca', 'mas claros', 'mas claro', 'opacos', 'sucios', 'tono de mis dientes', 'amarillo'],
        'Para dientes amarillos, manchados u oscuros te puede ayudar el blanqueamiento dental (incluido el blanqueamiento LED), que forma parte de nuestra rehabilitación y estética. Te muestro el servicio; la doctora valora tu caso.'],
      ['protesis', ['dentadura', 'protesis', 'placa dental', 'placas', 'corona', 'puente', 'no puedo masticar', 'no mastico', 'sin dientes', 'me faltan muchos', 'me faltan varios', 'muchos dientes', 'varios dientes', 'no puedo comer', 'me cuesta comer', 'me cuesta masticar', 'dificultad para comer', 'dientes postizos', 'ya no tengo dientes', 'no tengo dientes', 'sin ningun diente', 'todos mis dientes'],
        'Para reponer varias piezas o recuperar la masticación existen las prótesis dentales (parciales o totales). Te muestro el servicio; la doctora te dice cuál se ajusta a tu caso.'],
      ['implantes', ['implante', 'me falta', 'me faltan', 'perdi un', 'perdi mi', 'hueco', 'espacio vacio', 'sin diente', 'sin muela', 'raiz artificial', 'diente perdido', 'muela perdida', 'se me cayo un diente', 'se me cayo una muela', 'se me cayo el diente', 'se me cayo la muela', 'se me cayeron', 'reponer', 'reemplazar', 'reemplazo', 'quiero otro', 'se me salio un diente', 'se me salio una muela', 'perdi varios', 'me faltan varios', 'se me cayo un diente', 'se me cayo la muela'],
        'Cuando falta una pieza dental, los implantes son una opción: una raíz de titanio con su corona que recupera la función y se ve natural. Te muestro el servicio; la doctora valora si eres candidato.'],
      ['operatoria', ['caries', 'picad', 'sensib', 'empaste', 'resina', 'se rompio', 'se quebro', 'astill', 'fractur', 'desportill', 'limpieza', 'hoyo', 'hoyo en el diente', 'hoyo en la muela', 'agujero en el diente', 'agujero en la muela', 'duele con lo frio', 'con lo frio', 'con el frio', 'con lo caliente', 'al comer dulce', 'con lo dulce'],
        'Caries, dientes sensibles, rotos o picados se atienden en Operatoria dental: limpieza, resinas y restauraciones. Te muestro el servicio; la doctora te revisa.'],
      ['estetica', ['carilla', 'diseno de sonrisa', 'sonrisa gingival', 'forma de mis dientes', 'forma de los dientes', 'tamano de mis dientes', 'dientes pequen', 'dientes chiquit', 'dientes cort', 'desgastad', 'armonizar', 'contorneado', 'dientes feos', 'sonrisa fea', 'cambiar mi sonrisa', 'mejorar mi sonrisa', 'pena', 'verguenza', 'sonreir', 'sonrisa de famoso', 'sonrisa perfecta', 'sonrisa bonita'],
        'Para cambiar la forma o el tamaño de tus dientes y mejorar tu sonrisa tenemos carillas, diseño digital de sonrisa y contorneado dental. Te muestro el servicio; la doctora te orienta.'],
      ['otros', ['conducto', 'endodoncia', 'infeccion', 'absceso', 'muela del juicio', 'cordal', 'extraccion', 'extraer', 'sacar una muela', 'sacar un diente', 'me duele una', 'me duele un', 'me duele el', 'me duele la muela', 'duele mucho', 'dolor de muela', 'dolor de diente', 'dolor fuerte', 'punzada', 'inflamacion', 'cara hinchada', 'cara inflamada', 'mejilla hinchada', 'mejilla inflamada', 'inflamada por una muela', 'por una muela', 'por un diente', 'hinchazon', 'me van a sacar', 'sacarme una muela', 'sacarme un diente', 'muela rota', 'fiebre'],
        'Lo que describes puede requerir una endodoncia (tratamiento de conductos) o una extracción, según lo que encuentre la doctora. Si hay dolor fuerte o inflamación, te conviene agendar pronto. Te muestro el servicio y cómo contactarnos.']
    ];
    const dentalCtx = /(dient|muel|encia|boca|sonris|sonre|dental|labio|mandibul|quijada|cara|aliento)/.test(txt2());
    function txt2() { return ' ' + q.join(' ') + ' '; }
    const pideCasos = tiene('caso', 'casos', 'antes', 'despues', 'fotos', 'foto', 'resultados', 'resultado', 'galeria', 'ejemplos', 'pacientes', 'trabajos') || /como (queda|quedan|se ve|se ven) /.test(txt2());
    for (const [id, claves, respuesta] of SINTOMAS) {
      if (!pideCasos && claves.some(k => txt2().includes(' ' + k) && (dentalCtx || k.length > 5))) {
        const sv = SITIO.servicios.find(x => x.id === id);
        if (sv && !tiene('precio', 'costo', 'cuesta', 'cuanto', 'cita', 'agendar')) return { area: 'servicios', item: sv, texto: respuesta };
      }
    }

    // quiere conocer / ver la clínica (no su ubicación): se muestran las fotos de la clínica
    const preguntaLugar = /(donde (esta|estan|queda|se ubica|los encuentro)|ubicacion|direccion|llego|llegar|queda|ubicad|horario|telefono|mapa)/.test(txt);
    const sobreClinica = /(clinica|consultorio|instalacion|instalaciones|local|lugar|espacio|sucursal|recepcion|sala de espera|equipo|donde atienden|donde trabajan|donde me van|donde me atienden)/.test(txt);
    const verClinica = /( ver | vea | conocer | conozco | saber | hablame | cuentame | informacion | info | mostrar | muestrame | ensename | enseñame | fotos? | imagenes | como es | como son | que tal es | sobre )/.test(txt) || /^ (la |el |su |sus )?(clinica|consultorio|instalaciones) $/.test(txt) || /( se ve |es grande|es moderna|es bonita|es amplia|tienen|que equipo|donde atienden|donde trabajan)/.test(txt);
    if (sobreClinica && verClinica && !preguntaLugar && !/(doctora|dra|doctor|medico)/.test(txt))
      return { area: 'nosotros', instalaciones: true, item: SITIO.doctora, texto: 'Así es nuestra clínica: recepción, consultorio, equipo e instalaciones. En la sección Nosotros puedes verlas con más detalle.' };

    // piden ver casos, fotos o resultados: siempre se muestran los casos clínicos (el más parecido a lo que dicen)
    if ((tiene('caso', 'casos', 'antes', 'despues', 'fotos', 'foto', 'resultados', 'resultado', 'galeria', 'ejemplos', 'pacientes', 'trabajos') || /(como (queda|quedan|se ve|se ven) (un|una|el|la|los|las)? ?(implante|implantes|carilla|carillas|ortodoncia|brackets|blanqueamiento|protesis|limpieza|resina|resinas))/.test(txt)) && !tiene('privacidad', 'cookies', 'terminos')) {
      const SEMILLA = { blanqueamiento: 'caso-01', blanquear: 'caso-01', amarillos: 'caso-01', manchas: 'caso-01', carillas: 'caso-02', sonrisa: 'caso-02', ortodoncia: 'caso-03', brackets: 'caso-03', encias: 'caso-04', periodoncia: 'caso-04', protesis: 'caso-05', bruxismo: 'caso-05', coronas: 'caso-05', rehabilitacion: 'caso-05' };
      const c = mejor(SITIO.casos.map(item => ({ area: 'casos', item })));
      const idSem = (!c && q.map(w => SEMILLA[w]).find(Boolean)) || null;
      const cc = c ? c.item : idSem ? SITIO.casos.find(x => x.id === idSem) : null;
      if (cc) return { area: 'casos', item: cc, texto: cc.respuesta };
      return { area: 'casos', todos: true, texto: 'Aquí tienes nuestros casos clínicos con su antes y después. Toca el que te interese para ver las fases del tratamiento.' };
    }

    // aviso de privacidad, términos y cookies (por palabras clave y por el modelo)
    if (tiene('privacidad', 'cookies', 'terminos', 'condiciones', 'aviso', 'legal') || dominio === 'legal') return legal;
    // preguntas frecuentes (pagos, niños, urgencias, redes): se contesta y se muestran los datos de contacto
    const FAQ = [
      [['tarjeta', 'efectivo', 'pago', 'pagos', 'pagar', 'factura', 'facturan', 'facturas', 'recibo', 'recibos', 'comprobante', 'transferencia', 'meses', 'msi', 'seguro', 'seguros'], 'Aceptamos efectivo, tarjeta y transferencia, y podemos darte factura. Si tu tratamiento es largo, en la valoración se platica la forma de pago. Aquí tienes cómo contactarnos.'],
      [['nino', 'ninos', 'nina', 'ninas', 'hijo', 'hija', 'bebe', 'infantil', 'pediatrico', 'adolescente'], 'Atendemos pacientes de distintas edades. Para niños y adolescentes lo mejor es agendar una valoración y la doctora te indica qué tratamiento conviene. Aquí tienes cómo contactarnos.'],
      [['urgencia', 'urgente', 'emergencia', 'ahorita', 'urge'], 'Si tienes dolor o una urgencia, llámanos o escríbenos por WhatsApp para darte espacio lo antes posible. Aquí tienes los datos.'],
      [['instagram', 'facebook', 'youtube', 'redes', 'whatsapp', 'correo', 'email', 'telefono', 'llamar', 'numero'], SITIO.contacto.respuesta],
      [['hora', 'horas', 'abren', 'abre', 'cierran', 'cierra', 'abierto', 'sabado', 'sabados', 'domingo', 'horario', 'horarios', 'atienden'], 'Atendemos de lunes a viernes de 9:00 a 19:00 h y los sábados de 9:00 a 14:00 h. Aquí tienes los datos para agendar tu cita.'],
      [['estacionamiento', 'estacionar', 'metro', 'metrobus', 'camion', 'transporte', 'llego', 'llegar', 'cerca', 'rampa', 'accesible', 'discapacidad', 'silla'], 'Nuestras instalaciones cuentan con acceso para sillas de ruedas. Para dudas de llegada y estacionamiento, aquí tienes cómo contactarnos.']
    ];
    for (const [claves, texto] of FAQ) if (tiene(...claves) && !(claves.filter(c => q.includes(c)).join() === 'ya' && q.length > 3)) return { area: 'contacto', item: SITIO.contacto, texto };

    // quiere agendar: palabras clave (más fiables que la red para esto) o el modelo de intención
    const quiereCita = (tiene('cita', 'citas', 'agendar', 'agenda', 'apartar', 'reservar', 'reservacion', 'programar', 'reprogramar', 'cancelar', 'turno') && !tiene('precio', 'costo', 'cuesta')) || (tiene('valoracion', 'consulta', 'revision') && tiene('quiero', 'necesito', 'quisiera', 'apartar', 'reservar', 'agendar', 'programar', 'puedo', 'deseo'));
    if (quiereCita) return { area: 'contacto', item: SITIO.contacto, texto: 'Con gusto. Para agendar, reprogramar o cancelar tu cita, aquí tienes los datos de contacto de la clínica.' };
    if (pista && pista.intencion === 'solicitar_cita' && pista.intencionConfianza >= .5) return { area: 'contacto', item: SITIO.contacto, texto: SITIO.contacto.respuesta };

    if (svFrase) return { area: 'servicios', item: svFrase, texto: svFrase.respuesta };

    // palabras que sí son propias de la clínica (si no aparece ninguna y la frase es rara, es otro tema)
    const GENERICAS = new Set(['quien', 'donde', 'estudio', 'led', 'cafe', 'puente', 'espacios', 'mordida']);
    const PROPIAS = new Set([...SITIO.servicios, ...SITIO.casos, SITIO.doctora, SITIO.contacto].flatMap(x => x.claves || []).filter(c => !GENERICAS.has(c)));
    ['precio', 'precios', 'costo', 'costos', 'cuesta', 'cuanto', 'presupuesto', 'consultorio', 'instalaciones', 'dentista', 'diente', 'dientes', 'muela', 'muelas', 'dental', 'dentales', 'doctora', 'clinica', 'sonrisa', 'tratamiento', 'tratamientos', 'servicios', 'servicio', 'caso', 'casos', 'datos', 'rampa', 'sala', 'rayos', 'escaner'].forEach(x => PROPIAS.add(x));
    const propia = q.some(w => PROPIAS.has(w) || sinon(w));
    if (pista && pista.fueraDeTema && !propia) return { area: 'servicios', todosServicios: true, texto: OTRO_TEMA };
    if (!propia && !dominio && !tema && pista && pista.confianza < .6) return { area: 'servicios', todosServicios: true, texto: OTRO_TEMA };

    // instalaciones: se muestran las fotos de la clínica
    const pideLugar = tiene('donde', 'ubicacion', 'ubicados', 'direccion', 'llego', 'llegar', 'horario', 'abren');
    if (!pideLugar && (tiene('consultorio', 'instalaciones', 'instalacion', 'rampa', 'ruedas', 'recepcion', 'espera', 'escaner', 'rayos', 'sillon', 'esterilizacion', 'tecnologia') || (pista && pista.dominioModelo === 'instalaciones_tecnologia' && pista.confianza >= .6)))
      return { area: 'nosotros', instalaciones: true, item: SITIO.doctora, texto: 'Así es nuestra clínica: recepción, consultorio, equipo e instalaciones. En la sección Nosotros puedes verlas con más detalle.' };

    // síntomas o palabras de uso diario que equivalen a un servicio
    const sin = q.map(w => sinon(w)).find(Boolean);
    if (sin) { const sv = SITIO.servicios.find(x => x.id === sin); if (sv) return { area: 'servicios', item: sv, texto: sv.respuesta }; }

    const casosItems = SITIO.casos.map(item => ({ area: 'casos', item }));
    // 1) palabras clave muy específicas (un servicio, un caso, la doctora, el contacto)
    if (dominio === 'casos' || tiene('caso', 'casos', 'antes', 'despues', 'fotos', 'resultados')) {
      const c = mejor(casosItems);
      if (c) return { area: 'casos', item: c.item, texto: c.item.respuesta };
      if (dominio === 'casos' || tiene('caso', 'casos', 'antes', 'despues', 'fotos', 'resultados')) return { area: 'casos', todos: true, texto: 'Aquí tienes nuestros casos clínicos con su antes y después. Toca el que te interese para ver las fases del tratamiento.' };
    }
    const candidatos = [
      ...SITIO.servicios.map(item => ({ area: 'servicios', item })),
      { area: 'nosotros', item: SITIO.doctora }, { area: 'contacto', item: SITIO.contacto }
    ];
    const enDominio = dominio ? candidatos.filter(c => c.area === dominio) : candidatos;
    const r = mejor(enDominio) || mejor(candidatos);
    if (r) return { area: r.area, item: r.item, texto: r.item.respuesta };

    // precios: no hay tarifas publicadas, se orienta a la valoración
    if (tiene('precio', 'precios', 'costo', 'costos', 'cuesta', 'cuestan', 'presupuesto', 'cotizacion', 'tarifa', 'tarifas'))
      return { area: 'contacto', item: SITIO.contacto, texto: 'El costo depende de cada caso y se define en la valoración, para darte un presupuesto claro. Te muestro cómo contactarnos para agendarla.' };

    // 2) sin palabras clave: se contesta según lo que detectó la red neuronal (tema y dominio)
    if (dominio === 'servicios' && tema && TEMA_SERVICIO[tema]) { const s = SITIO.servicios.find(x => x.id === TEMA_SERVICIO[tema]); if (s) return { area: 'servicios', item: s, texto: s.respuesta }; }
    const lista = SITIO.servicios.map(s => s.titulo.toLowerCase()).join(', ');
    const porDominio = {
      servicios: { area: 'servicios', todosServicios: true, texto: `Estos son nuestros servicios: ${lista}. ¿Sobre cuál te gustaría saber más?` },
      casos: { area: 'casos', todos: true, texto: 'Aquí tienes nuestros casos clínicos con su antes y después.' },
      nosotros: { area: 'nosotros', item: SITIO.doctora, texto: pista && pista.dominioModelo === 'instalaciones_tecnologia' ? 'En la sección Nosotros puedes conocer nuestras instalaciones, el consultorio y a la doctora que te atenderá.' : SITIO.doctora.respuesta },
      contacto: { area: 'contacto', item: SITIO.contacto, texto: SITIO.contacto.respuesta }
    };
    if (tiene('servicios', 'servicio', 'tratamientos', 'tratamiento', 'procedimientos', 'ofrecen')) return porDominio.servicios;
    if (dominio && porDominio[dominio]) return porDominio[dominio];

    // 3) habla de dientes pero no se supo de qué servicio: se orienta a la valoración, no se rechaza
    if (tiene('diente', 'dientes', 'muela', 'muelas', 'boca', 'dental', 'dentales', 'sonrisa', 'encia', 'encias', 'dentista', 'odontologo', 'odontologia'))
      return { area: 'contacto', item: SITIO.contacto, texto: 'Para tu caso lo mejor es una valoración con la doctora, que revisa tu boca y te indica el tratamiento que conviene. Aquí tienes cómo agendarla; si quieres, también puedo explicarte alguno de nuestros servicios.' };
    // 4) no se entendió (o es de otro tema): igual se contesta y se orienta
    if (pista && pista.fueraDeTema) return { area: 'servicios', todosServicios: true, texto: OTRO_TEMA };
    return { area: 'servicios', todosServicios: true, texto: `No tengo ese dato exacto, pero con gusto te ayudo con otra cosa. Puedo hablarte de nuestros servicios (${lista}), mostrarte casos clínicos, contarte sobre la doctora o darte los datos para agendar tu cita. ¿Qué te interesa?` };
  }
};
