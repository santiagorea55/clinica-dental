/* Piezas reutilizables de la interfaz (React) */
import { useEffect, useMemo, useRef, useState } from 'react';

export const { servicios, casos, doctora, contacto, legal } = SITIO;

// Icono de línea (usa js/icons.js)
export const I = ({ n, s = 24 }) => <span className="ico" dangerouslySetInnerHTML={{ __html: ic(n, s) }} />;

// Aparece suavemente cuando entra en pantalla (desvanecido + subida)
export function Reveal({ as: Tag = 'div', delay = 0, className = '', children, ...props }) {
  const ref = useRef(null);
  const [visto, setVisto] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!('IntersectionObserver' in window)) return setVisto(true);
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisto(true); io.disconnect(); } }, { threshold: 0.1, rootMargin: '0px 0px -30px 0px' });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return <Tag ref={ref} className={`rv ${visto ? 'in' : ''} ${className}`} style={{ '--d': `${delay}ms` }} {...props}>{children}</Tag>;
}

// Imagen con respaldo: usa el .jpg; si no existe prueba .jpeg/.png/.webp, luego el .svg y, si no, un icono.
const EXT = ['jpg', 'jpeg', 'png', 'webp', 'svg'];
export function Foto({ titulo = '', src, icono = 'tooth' }) {
  const [paso, setPaso] = useState(0);
  const [listo, setListo] = useState('');
  const lista = useMemo(() => {
    if (!src) return [];
    const base = src.replace(/\.\w+$/, '');
    const i = Math.max(0, EXT.indexOf(src.split('.').pop().toLowerCase()));
    return EXT.slice(i).map(e => `${base}.${e}`);
  }, [src]);
  const url = lista[paso];
  useEffect(() => { setPaso(0); }, [src]);
  const cargada = listo === url;
  // Si la imagen ya estaba en caché, 'load' ocurre antes de que React la monte: se revisa al crearla.
  const revisar = el => { if (el && el.complete && el.naturalWidth > 0) setListo(url); };
  return (
    <div className="img-box">
      <div className="ph"><I n={icono} s={56} /></div>
      {titulo && <span>{titulo}</span>}
      {url && (
        <img key={url} className={`${cargada ? 'ok' : ''} ${url.endsWith('.svg') ? 'svg' : ''}`} src={encodeURI(url)} alt={titulo} ref={revisar} decoding="async" loading="lazy"
          onLoad={() => setListo(url)} onError={() => setPaso(p => p + 1)} />
      )}
    </div>
  );
}

export const Insignias = ({ lista }) => lista.map((b, i) => <span key={i} className="badge"><I n={b.icono} s={18} /> {b.texto}</span>);

export const Migas = ({ children }) => <div className="breadcrumb">{children}</div>;

export const TarjetaServicio = ({ s, i }) => (
  <Reveal as="a" href={`#/servicios/${s.id}`} className="card link" delay={i * 70}>
    <div className="serv-foto"><Foto src={s.imagen} icono={s.icono} /></div><b>{s.titulo}</b><span>{s.corta}</span><span className="der"><I n="arrow" s={20} /></span>
  </Reveal>
);

export const CuadriculaServicios = () => <div className="grid4">{servicios.map((s, i) => <TarjetaServicio key={s.id} s={s} i={i} />)}</div>;

export const TarjetaCaso = ({ c, i = 0 }) => (
  <Reveal className="card" delay={i * 80}>
    <Foto titulo={c.area} src={c.portada} icono="smile" />
    <small className="tag">CASO {c.numero} · {c.area}</small><h3>{c.titulo}</h3><p>{c.resumen}</p>
    <a className="btn" href={`#/casos/${c.id}`}>Ver caso →</a>
  </Reveal>
);

export const Banner = () => (
  <Reveal as="section" className="box banner">
    <div><h2>¿Tienes dudas sobre alguno de estos procedimientos?</h2><p>Consulta con nuestro asistente o contáctanos.</p></div>
    <div className="acciones"><a className="btn claro" href="#/inicio">Hablar con el asistente</a> <a className="btn fantasma-claro" href="#/contacto">Agendar cita →</a></div>
  </Reveal>
);
