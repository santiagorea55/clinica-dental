/* Vistas: servicios, casos, nosotros, contacto y legales */
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { I, Foto, Reveal, Insignias, Migas, CuadriculaServicios, TarjetaCaso, Banner, servicios, casos, doctora, contacto, legal } from './ui.jsx';

/* ---------- Servicios ---------- */
function Procedimiento({ s, p, onCerrar }) {
  useEffect(() => {
    const esc = e => e.key === 'Escape' && onCerrar();
    addEventListener('keydown', esc); return () => removeEventListener('keydown', esc);
  }, [onCerrar]);
  return createPortal(
    <div className="modal" onClick={e => e.target === e.currentTarget && onCerrar()}>
      <div className="box">
        <Foto titulo={p.titulo} src={p.imagen} icono={s.icono} />
        <h2>{p.titulo}</h2><p>{p.descripcion}</p><p>Servicio: {s.titulo}</p>
        <p><a className="btn" href="#/contacto" onClick={onCerrar}>Agendar cita →</a> <button className="btn fantasma" onClick={onCerrar}>Cerrar</button></p>
      </div>
    </div>, document.body);
}

export function Servicios({ id }) {
  const [abierto, setAbierto] = useState(null);
  const s = servicios.find(x => x.id === id);
  if (!s) return (
    <>
      <Migas>Inicio / <b>Servicios</b></Migas>
      <Reveal as="section" className="box"><h2>Servicios / Tratamientos</h2><CuadriculaServicios /></Reveal>
      <Banner />
    </>
  );
  return (
    <>
      <Migas>Inicio / <a href="#/servicios">Servicios</a> / <b>{s.titulo}</b></Migas>
      <Reveal as="section" className="box cols2"><div><h1>{s.titulo}</h1><p>{s.descripcion || s.corta}</p></div><Foto titulo={s.titulo} src={s.imagen} icono={s.icono} /></Reveal>
      <Reveal as="section" className="box cols2" delay={80}>
        <div><h2><I n="tooth" s={28} /> ¿Qué es?</h2><p>{s.descripcion || 'Información próxima a publicarse.'}</p></div>
        <div><h2>Beneficios</h2><Insignias lista={s.beneficios || []} /></div>
      </Reveal>
      {(s.procedimientos || []).length > 0 && (
        <Reveal as="section" className="box"><h2>Procedimientos disponibles</h2>
          <div className="grid4">{s.procedimientos.map((p, i) => (
            <Reveal key={p.titulo} className="card" delay={i * 80}>
              <Foto titulo={p.titulo} src={p.imagen} icono={s.icono} /><b>{p.titulo}</b><span>{p.descripcion}</span>
              <button className="btn" onClick={() => setAbierto(i)}>Ver más →</button>
            </Reveal>))}</div>
        </Reveal>)}
      <Banner />
      {abierto !== null && <Procedimiento s={s} p={s.procedimientos[abierto]} onCerrar={() => setAbierto(null)} />}
    </>
  );
}

/* ---------- Casos clínicos ---------- */
const CATEGORIAS = ['Todas las categorías', 'Implantes', 'Rehabilitación oral', 'Diseño de sonrisa', 'Ortodoncia', 'Otros casos'];

export function Casos({ id }) {
  const [cat, setCat] = useState(CATEGORIAS[0]);
  const c = casos.find(x => x.id === id);
  if (c) return (
    <>
      <Migas>Inicio / <a href="#/casos">Casos clínicos</a> / <b>Caso {c.numero}</b></Migas>
      <Reveal as="section" className="box cols2">
        <div><small className="tag">CASO {c.numero} · {c.area}</small><h1>{c.titulo}</h1><p>{c.resumen}</p></div>
        <div><h2><I n="chart" s={26} /> Tratamiento realizado</h2><p>{c.tratamiento}</p></div>
      </Reveal>
      <Reveal as="section" className="box"><h2>Fases del caso</h2>
        <div className="phases">{c.fases.map((f, i) => (
          <Reveal key={i} className="card" delay={i * 120}>
            <small className="tag">FASE {i + 1} · {f.etapa.toUpperCase()}</small><Foto src={f.imagen} icono="smile" /><b>{f.titulo}</b>
          </Reveal>))}</div>
      </Reveal>
      <Banner />
    </>
  );
  const lista = casos.filter(x => cat.startsWith('Todas') || x.categoria === cat);
  return (
    <>
      <Migas>Inicio / <b>Casos clínicos</b></Migas>
      <Reveal as="section" className="box"><h1>Casos clínicos</h1>
        <div className="filters">{CATEGORIAS.map(x => <button key={x} className={`btn chip ${x === cat ? 'on' : ''}`} onClick={() => setCat(x)}>{x}</button>)}</div>
        <div className="grid4" key={cat}>{lista.length ? lista.map((x, i) => <TarjetaCaso key={x.id} c={x} i={i} />) : <p>Aún no hay casos en esta categoría.</p>}</div>
      </Reveal>
    </>
  );
}

/* ---------- Nosotros ---------- */
const AREAS = [['Odontología general', 'tooth'], ['Odontología estética', 'sparkle'], ['Ortodoncia', 'braces'], ['Endodoncia', 'magnify'],
  ['Implantología', 'implant'], ['Rehabilitación oral', 'tooth'], ['Periodoncia', 'gum'], ['Operatoria dental', 'tools']];
const COMPROMISOS = [['Atención personalizada', 'users'], ['Calidad en cada tratamiento', 'shield'], ['Información clara y honesta', 'chat'], ['Seguimiento clínico', 'chart']];
const CLINICA = [['Interior / recepción', 'recepcion', 'calendar'], ['Consultorio', 'consultorio', 'tools'], ['Equipo', 'equipo', 'users'], ['Instalaciones', 'instalaciones', 'shield']];

export function Nosotros() {
  return (
    <>
      <Migas>Inicio / <b>Nosotros</b></Migas>
      <Reveal as="section" className="box cols2 dra-grid"><div className="dra-foto"><Foto src="assets/img/dra.jpg" icono="users" /></div>
        <div><small className="tag">CONÓCENOS</small><h1>{doctora.titulo}</h1><b>{doctora.subtitulo}</b><p>{doctora.descripcion}</p></div></Reveal>
      <Reveal as="section" className="box creds">{doctora.credenciales.map(([i, t]) => <div key={t}><I n={i} s={38} /><span>{t}</span></div>)}</Reveal>
      <Reveal as="section" className="box"><h2>Áreas de atención</h2>
        <div className="grid4">{AREAS.map(([t, i], k) => <Reveal key={t} className="card tc" delay={k * 60}><I n={i} s={36} /><b>{t}</b></Reveal>)}</div></Reveal>
      <section className="cols2">
        <Reveal className="box"><h2>Nuestra filosofía</h2><p>{doctora.filosofia}</p></Reveal>
        <Reveal className="box" delay={120}><h2>Nuestro compromiso</h2>{COMPROMISOS.map(([t, i]) => <span key={t} className="badge"><I n={i} s={18} /> {t}</span>)}</Reveal>
      </section>
      <Reveal as="section" className="box"><h2>Nuestra clínica</h2>
        <div className="grid4">{CLINICA.map(([t, f, i], k) => <Reveal key={f} delay={k * 80}><Foto titulo={t} src={`assets/img/${f}.jpg`} icono={i} /></Reveal>)}</div></Reveal>
      <Reveal as="section" className="box banner">
        <div><h3><I n="calendar" s={26} /> ¿Te gustaría conocernos en persona?</h3><p>Agenda tu cita y da el primer paso hacia una mejor sonrisa.</p></div>
        <a className="btn claro" href="#/contacto">Agenda tu cita →</a>
      </Reveal>
    </>
  );
}

/* ---------- Contacto ---------- */
export function Contacto() {
  const [enviado, setEnviado] = useState(false);
  return (
    <>
      <Migas>Inicio / <b>Contacto</b></Migas>
      <Reveal as="section" className="box cols2">
        <form className="card form" onSubmit={e => { e.preventDefault(); setEnviado(true); e.target.reset(); setTimeout(() => setEnviado(false), 5000); }}>
          <h2>Formulario de contacto</h2>
          <input placeholder="Nombre" required /><input placeholder="Teléfono" /><textarea placeholder="Mensaje" rows="4" />
          <button className="btn">Enviar</button>
          {enviado && <p className="ok-msg"><I n="check" s={18} /> Mensaje enviado (demostración)</p>}
        </form>
        <div className="contact-info">
          <p><I n="pin" s={20} /> <b>Ubicación:</b> {contacto.ubicacion}</p>
          <p><I n="phone" s={20} /> <b>Teléfono / WhatsApp:</b> {contacto.telefono}</p>
          <p><I n="mail" s={20} /> <b>Correo:</b> {contacto.correo}</p>
          <p><I n="clock" s={20} /> <b>Horarios:</b> {contacto.horarios}</p>
          <div className="redes-contacto">{(contacto.redes || []).map(r => <a key={r.n} href={r.url} target="_blank" rel="noopener noreferrer" title={r.nombre}><I n={r.n} s={20} /> {r.usuario}</a>)}</div>
        </div>
        <div className="mapa-real mapa-ancho">
          <iframe title="Ubicación de la clínica en Google Maps" loading="lazy" referrerPolicy="no-referrer-when-downgrade" allowFullScreen
            src={contacto.mapaEmbed || `https://www.google.com/maps?q=${encodeURIComponent(contacto.mapaConsulta)}&hl=es&z=16&output=embed`} />
          <a className="btn" href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(contacto.mapaEnlace || contacto.mapaConsulta)}`} target="_blank" rel="noopener noreferrer"><I n="pin" s={18} /> Abrir en Google Maps</a>
        </div>
      </Reveal>
    </>
  );
}

/* ---------- Avisos legales ---------- */
export function Legal({ id }) {
  const l = legal.find(x => x.id === id) || legal[0];
  return (
    <>
      <Migas>Inicio / <b>{l.titulo}</b></Migas>
      <Reveal as="section" className="box"><h1>{l.titulo}</h1>{l.texto.split('\n\n').map((t, i) => <p key={i}>{t}</p>)}</Reveal>
    </>
  );
}
