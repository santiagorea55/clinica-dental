/* CLÍNICA DRA. JANET · interfaz en React
   Código fuente. Se compila a js/app.bundle.js (ver README). Datos: js/contenido.js · Ajustes: js/config.js */
import { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { I, contacto } from './ui.jsx';
import { Inicio } from './inicio.jsx';
import { useVida } from './vida.jsx';
import { Servicios, Casos, Nosotros, Contacto, Legal } from './vistas.jsx';

const VISTAS = { inicio: Inicio, servicios: Servicios, casos: Casos, nosotros: Nosotros, contacto: Contacto, legal: Legal };
const ENLACES = [['inicio', 'Inicio'], ['servicios', 'Servicios'], ['casos', 'Casos clínicos'], ['nosotros', 'Nosotros'], ['contacto', 'Contacto']];

const useHash = () => {
  const [hash, setHash] = useState(location.hash);
  useEffect(() => { const f = () => setHash(location.hash); addEventListener('hashchange', f); return () => removeEventListener('hashchange', f); }, []);
  return hash;
};

// Barra fina que avanza con el scroll
function Progreso() {
  const ref = useRef(null);
  useEffect(() => {
    const f = () => { const d = document.documentElement; ref.current.style.transform = `scaleX(${d.scrollTop / ((d.scrollHeight - d.clientHeight) || 1)})`; };
    f(); addEventListener('scroll', f, { passive: true }); addEventListener('resize', f);
    return () => { removeEventListener('scroll', f); removeEventListener('resize', f); };
  }, []);
  return <div className="progreso" ref={ref} />;
}

// Encabezado: marca a la izquierda, menú al centro y botón de cita a la derecha
function Cabecera({ vista }) {
  const [logo, setLogo] = useState(true);
  const [chico, setChico] = useState(false);
  useEffect(() => {
    const f = () => setChico(prev => (prev ? window.scrollY > 12 : window.scrollY > 80));
    f(); window.addEventListener('scroll', f, { passive: true });
    return () => window.removeEventListener('scroll', f);
  }, []);
  return (
    <header className={`site-header ${chico ? 'chico' : ''}`}>
      <div className="sh-in">
        <a className="brand" href="#/inicio" aria-label="Clínica Dra. Janet · inicio">
          <span className="logo-box">{logo ? <img src="assets/img/logo.jpg" alt="Logo" onError={() => setLogo(false)} /> : <span>LOGO</span>}</span>
          <span className="brand-info"><span className="brand-name">CLÍNICA DRA. JANET</span><span className="slogan">Odontología Integral Estética</span></span>
        </a>
        <nav className="main-nav" aria-label="Principal">
          {ENLACES.map(([k, t]) => <a key={k} href={`#/${k}`} className={vista === k ? 'on' : ''} aria-current={vista === k ? 'page' : undefined}>{t}</a>)}
        </nav>
        <a className="btn cta" href="#/contacto">Agendar cita</a>
      </div>
    </header>
  );
}

const Pie = () => (
  <footer className="footer">
    <div className="ft-in">
      <div className="ft-col ft-marca"><h4>CLÍNICA DRA. JANET</h4><p>{contacto.ubicacion}</p><p>{contacto.telefono}</p><p>{contacto.correo}</p></div>
      <div className="ft-col"><h4>Enlaces</h4><p><a href="#/legal/privacidad">Aviso de privacidad</a></p><p><a href="#/legal/terminos">Términos y condiciones</a></p><p><a href="#/legal/cookies">Cookies</a></p></div>
      <div className="ft-col"><h4>Redes sociales</h4><div className="social">{(contacto.redes || []).map(r => <a key={r.n} href={r.url} target="_blank" rel="noopener noreferrer" title={r.nombre} aria-label={r.nombre}><I n={r.n} s={20} /></a>)}</div></div>
    </div>
  </footer>
);

// Botón de modo claro/oscuro (esquina inferior derecha). Recuerda la elección.
function BotonTema() {
  const [oscuro, setOscuro] = useState(() => document.documentElement.dataset.tema === 'dark');
  const cambiar = () => {
    const r = document.documentElement, nuevo = !oscuro; r.classList.add('cambiando');
    if (nuevo) r.dataset.tema = 'dark'; else delete r.dataset.tema;
    setOscuro(nuevo); try { localStorage.setItem('tema', nuevo ? 'dark' : 'light'); } catch (e) {}
    setTimeout(() => r.classList.remove('cambiando'), 700);
  };
  return (
    <button className="tema-btn" onClick={cambiar} title={oscuro ? 'Modo claro' : 'Modo oscuro'} aria-label="Cambiar entre modo claro y oscuro">
      {oscuro
        ? <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="4.2" /><path d="M12 2.5v2.4M12 19.1v2.4M2.5 12h2.4M19.1 12h2.4M5.3 5.3l1.7 1.7M17 17l1.7 1.7M5.3 18.7L7 17M17 7l1.7-1.7" /></svg>
        : <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.5 14.2A8.5 8.5 0 0 1 9.8 3.5a8.5 8.5 0 1 0 10.7 10.7z" /></svg>}
    </button>
  );
}

// Orden de las pantallas: sirve para saber hacia qué lado se desliza el cambio
const orden = h => { const [, v = 'inicio', id] = h.split('/'); const i = ENLACES.findIndex(([k]) => k === v); return (i < 0 ? 9 : i) * 10 + (id ? 1 : 0); };

function App() {
  const hash = useHash();
  const [mostrado, setMostrado] = useState(hash);      // pantalla que se ve ahora
  const [fase, setFase] = useState('in');              // 'out' = saliendo · 'in' = entrando
  const dir = useRef(1);
  useEffect(() => {
    if (hash === mostrado) return;
    dir.current = orden(hash) >= orden(mostrado) ? 1 : -1;
    if (window.speechSynthesis) speechSynthesis.cancel();
    setFase('out');
    const lejos = scrollY > 40;
    if (lejos) window.scrollTo({ top: 0, behavior: 'smooth' });   // sube deslizando mientras la pantalla se desvanece
    const t = setTimeout(() => { window.scrollTo({ top: 0, behavior: 'instant' }); setMostrado(hash); setFase('in'); }, lejos ? 380 : 300);
    return () => clearTimeout(t);
  }, [hash]);
  const [, vista = 'inicio', id] = mostrado.split('/');
  const Vista = VISTAS[vista] || Inicio;
  const [, vivo = 'inicio'] = hash.split('/');
  useVida(mostrado);
  return (
    <>
      <Progreso />
      <BotonTema />
      <div className="pagina">
        <Cabecera vista={VISTAS[vivo] ? vivo : 'inicio'} />
        <main key={mostrado} className={`${fase} v-${vista || "inicio"}`} style={{ '--dir': dir.current }}><Vista id={id} /></main>
        <Pie />
      </div>
    </>
  );
}

try { if (localStorage.getItem('tema') === 'dark') document.documentElement.dataset.tema = 'dark'; } catch (e) {}
createRoot(document.getElementById('root')).render(<App />);
