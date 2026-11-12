/* Pantalla de inicio: portada + asistente virtual + zona inteligente */
import { useEffect, useMemo, useRef, useState } from 'react';
import { Marquesina } from './vida.jsx';
import { I, Foto, Reveal, Insignias, CuadriculaServicios, TarjetaCaso, casos } from './ui.jsx';

const CFG = { respuestas: false, ...(window.CONFIG_ASISTENTE || {}) };
const AVISO = 'Todavía estoy en proceso de entrenamiento, por eso aún no puedo responder tus preguntas. Muy pronto estaré lista; mientras tanto explora nuestros servicios o escríbenos desde Contacto.';
const SALUDO = 'Hola, soy el asistente de la Clínica Dental Dra. Janet. ¿En qué puedo ayudarte?';
const SUGERENCIAS = ['¿Qué servicios ofrecen?', 'Tengo los dientes amarillos', 'Quiero ver casos de ortodoncia', 'Quiero agendar una cita'];
const ETIQUETA = { servicios: 'SERVICIO', casos: 'CASOS', nosotros: 'NOSOTROS', contacto: 'CONTACTO', legal: 'LEGAL' };

// Zona que cambia según lo que responde el asistente (solo se usa si CONFIG_ASISTENTE.respuestas = true)
function Zona({ r, onRel }) {
  if (!r) return (
    <>
      <div className="zhead"><h2>Servicios / Tratamientos</h2><p>Conoce nuestras principales áreas de atención.</p></div>
      <CuadriculaServicios />
    </>
  );
  if (r.todosServicios) return (<><div className="zhead"><h2>Servicios / Tratamientos</h2><p>Conoce nuestras principales áreas de atención.</p></div><CuadriculaServicios /></>);
  if (r.area === 'ninguno') return <div className="zhead"><h2>No encontré eso</h2><p>Prueba preguntando por un servicio, un caso clínico, la doctora o el contacto.</p></div>;
  if (r.area === 'legal') return (<><div className="zhead"><span className="badge">{ETIQUETA.legal}</span></div><div className="contact-info"><h2>Información legal</h2>{r.item.map(l => <p key={l.id}><a className="btn" href={`#/legal/${l.id}`}>{l.titulo} →</a></p>)}</div></>);
  const it = r.item;
  const rel = ((it && it.relacionados) || []).map(id => Asistente.buscar(id)).filter(Boolean);
  let cuerpo;
  if (r.todos) cuerpo = <div className="grid4">{casos.map((c, i) => <TarjetaCaso key={c.id} c={c} i={i} />)}</div>;
  else if (r.area === 'servicios') cuerpo = (
    <div className="sz-card"><Foto titulo={it.titulo} src={it.imagen} icono={it.icono} />
      <div><h2>{it.titulo}</h2><p>{it.descripcion || it.corta}</p><Insignias lista={it.beneficios || []} />
        <p><a className="btn" href={`#/servicios/${it.id}`}>Ver sección completa →</a></p></div></div>);
  else if (r.area === 'casos') cuerpo = <div className="grid4"><TarjetaCaso c={it} /></div>;
  else if (r.area === 'nosotros' && r.instalaciones) cuerpo = (
    <div><div className="grid4">{[['Interior / recepción', 'recepcion', 'calendar'], ['Consultorio', 'consultorio', 'tools'], ['Equipo', 'equipo', 'users'], ['Instalaciones', 'instalaciones', 'shield']].map(([t, f, i]) => <Foto key={f} titulo={t} src={`assets/img/${f}.jpg`} icono={i} />)}</div>
      <p><a className="btn" href="#/nosotros">Ver la clínica completa →</a></p></div>);
  else if (r.area === 'nosotros') cuerpo = (
    <div className="sz-card"><Foto src="assets/img/dra.jpg" icono="users" />
      <div><h2>{it.titulo}</h2><b>{it.subtitulo}</b><p>{it.descripcion}</p><p><a className="btn" href="#/nosotros">Conocer más →</a></p></div></div>);
  else cuerpo = (
    <div className="contact-info"><h2>{it.titulo}</h2><p><I n="pin" s={20} /> {it.ubicacion}</p><p><I n="phone" s={20} /> {it.telefono}</p><p><I n="mail" s={20} /> {it.correo}</p>
      <p><I n="clock" s={20} /> {it.horarios}</p><p><a className="btn" href="#/contacto">Agendar cita →</a></p></div>);
  return (
    <>
      <div className="zhead"><span className="badge">{ETIQUETA[r.area]}</span></div>
      {cuerpo}
      {rel.length > 0 && <div className="rec"><b>También te puede interesar:</b>{rel.map((x, i) => <button key={i} className="btn chip" onClick={() => onRel(x)}>{x.item.titulo}</button>)}</div>}
    </>
  );
}

// Imagen que cubre todo el recuadro de la portada (assets/img/hero.jpg), semitransparente y con un zoom muy lento
function FondoHero({ src = 'assets/img/hero.jpg' }) {
  const lista = useMemo(() => { const b = src.replace(/\.\w+$/, ''); return ['jpg', 'jpeg', 'png', 'webp'].map(e => `${b}.${e}`); }, [src]);
  const [paso, setPaso] = useState(0); const [ok, setOk] = useState(false);
  const url = lista[paso];
  return (
    <div className="hero-fondo" aria-hidden="true">
      {url && <img key={url} className={ok ? 'ok' : ''} src={encodeURI(url)} alt="" ref={el => { if (el && el.complete && el.naturalWidth > 0) setOk(true); }} onLoad={() => setOk(true)} onError={() => setPaso(p => p + 1)} />}
    </div>
  );
}

function PanelAsistente({ onZona }) {
  const [msgs, setMsgs] = useState([{ de: 'bot', t: SALUDO }]);
  const [q, setQ] = useState('');
  const [pensando, setPensando] = useState(false);
  const [hablando, setHablando] = useState(false);
  const [mudo, setMudo] = useState(!!Avatar.muted);
  const avatarRef = useRef(null), chatRef = useRef(null), tiempo = useRef(0);

  useEffect(() => { if (CFG.clasificar !== false) Clasificador.cargar(); }, []);   // red neuronal entrenada (si existe la carpeta modelo/)
  useEffect(() => { Avatar.mount(avatarRef.current); return () => { clearTimeout(tiempo.current); if (window.speechSynthesis) speechSynthesis.cancel(); }; }, []);
  useEffect(() => { const c = chatRef.current; if (c) c.scrollTo({ top: c.scrollHeight, behavior: 'smooth' }); }, [msgs, pensando]);

  const preguntar = texto => {
    const t = (texto ?? q).trim();
    if (!t || pensando) return;
    setMsgs(m => [...m, { de: 'yo', t }]); setQ(''); setPensando(true);
    Avatar.expr('pensando');
    // Con la red neuronal lista, ella detecta el tema; las respuestas salen de js/asistente.js + js/contenido.js
    const pista = CFG.clasificar !== false && Clasificador.listo ? Clasificador.predecir(Asistente.corregir(t)) : null;
    const r = CFG.respuestas ? Asistente.responder(t, pista) : { area: 'otro', texto: AVISO };
    setTimeout(() => {
      setPensando(false);
      setMsgs(m => [...m, { de: 'bot', t: r.texto }]);
      onZona(r);
      Avatar.speak(r.texto);
      setHablando(true); clearTimeout(tiempo.current);
      tiempo.current = setTimeout(() => setHablando(false), Math.max(2000, (r.texto.length / 14) * 1000));
    }, 800);
  };
  const dictar = () => {
    const R = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!R) return alert('Tu navegador no soporta dictado por voz (use Chrome o Edge).');
    const r = new R(); r.lang = 'es-MX'; r.onresult = e => preguntar(e.results[0][0].transcript); r.start();
  };
  const silenciar = () => { Avatar.muted = !Avatar.muted; setMudo(Avatar.muted); if (window.speechSynthesis) speechSynthesis.cancel(); };

  return (
    <div className="assistant-card">
      <h3><span className="vivo" /> Asistente virtual
        <button className="icon-btn" onClick={silenciar} title={mudo ? 'Activar voz' : 'Silenciar voz'}><I n={mudo ? 'mute' : 'sound'} s={18} /></button></h3>
      <div className="ac-body">
        <div className={`avatar-frame ${hablando || pensando ? 'activo' : ''}`}><div id="avatar" ref={avatarRef} /></div>
        <div className="chat" ref={chatRef}>
          {msgs.map((m, i) => <div key={i} className={`bubble ${m.de === 'yo' ? 'me' : ''}`}>{m.t}</div>)}
          {pensando && <div className="bubble escribiendo"><i /><i /><i /></div>}
        </div>
      </div>
      {!msgs.some(m => m.de === 'yo') && (
        <div className="sugerencias" aria-label="Preguntas de ejemplo">{SUGERENCIAS.map(t => <button key={t} className="sug" onClick={() => preguntar(t)}>{t}</button>)}</div>
      )}
      <div className="chat-input">
        <input value={q} onChange={e => setQ(e.target.value)} onKeyDown={e => e.key === 'Enter' && preguntar()} placeholder="Escribe tu consulta..." autoComplete="off" />
        <button className="icon-btn primario" onClick={() => preguntar()} title="Enviar"><I n="send" s={20} /></button>
        <button className="icon-btn" onClick={dictar} title="Hablar"><I n="mic" s={20} /></button>
      </div>
    </div>
  );
}
export function Inicio() {
  const [zona, setZona] = useState(null);
  const alResponder = r => { if (r.area !== 'otro') setZona(r); };   // el asistente avisa a la zona
  return (
    <>
      <section className="hero">
        <FondoHero />
        <span className="orb o1" aria-hidden="true" /><span className="orb o2" aria-hidden="true" /><span className="orb o3" aria-hidden="true" />
        <div className="hero-assistant-grid hero-in">
          <div className="hero-text">
            <span className="pill" style={{ '--i': 0 }}>Odontología Integral Estética</span>
            <h1 style={{ '--i': 1 }} aria-label="Tu sonrisa, nuestra prioridad">
              {[['Tu'], ['sonrisa', 1, 1], [','], ['nuestra'], ['prioridad']].map(([t, em, pegada], k) => (
                <span key={k} className={`pal ${em ? 'acento' : ''}`} aria-hidden="true" style={{ '--w': k }}>{t}{pegada ? '' : ' '}</span>))}
            </h1>
            <p style={{ '--i': 2 }}>Cuidamos tu salud bucal con atención profesional.</p>
            <div style={{ '--i': 3 }}><a className="btn claro" href="#/servicios">Conoce nuestros servicios</a></div>
          </div>
          <PanelAsistente onZona={alResponder} />
        </div>
        <Marquesina />
      </section>
      <Reveal as="section" className="box" id="zona">
        <div key={zona ? (zona.item ? zona.item.id : zona.area) : 'base'} className="zona-contenido"><Zona r={zona} onRel={setZona} /></div>
      </Reveal>
    </>
  );
}
