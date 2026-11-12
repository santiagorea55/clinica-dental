/* Efectos de "vida" de la página (React): inclinación 3D en tarjetas, botones magnéticos, parallax de la portada,
   contadores animados y marquesina de servicios. Todo se apaga solo en celulares táctiles o si el equipo pide menos movimiento. */
import { useEffect, useRef, useState } from 'react';
import { I, Reveal, servicios, casos } from './ui.jsx';

const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const sinMov = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
const tactil = () => matchMedia('(hover: none)').matches;

// Un solo escuchador para toda la página: inclinación de tarjetas, imán en botones y movimiento de la portada
export function useVida(clave) {
  useEffect(() => {
    if (sinMov() || tactil()) return;
    let actual = null, raf = 0, ev = null;
    const soltar = el => { if (!el) return; el.style.setProperty('--rx', '0deg'); el.style.setProperty('--ry', '0deg'); el.classList.remove('tilt-on'); };
    const procesar = () => {
      raf = 0; const e = ev; if (!e) return;
      const t = e.target.closest ? e.target.closest('.card:not(.form), .assistant-card, .cifra') : null;
      if (t !== actual) { soltar(actual); actual = t; }
      if (t) {
        const r = t.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
        const max = t.classList.contains('assistant-card') ? 3 : 7;
        t.classList.add('tilt-on');
        t.style.setProperty('--ry', `${((x - .5) * 2 * max).toFixed(2)}deg`); t.style.setProperty('--rx', `${(-(y - .5) * 2 * max).toFixed(2)}deg`);
        t.style.setProperty('--gx', `${(x * 100).toFixed(1)}%`); t.style.setProperty('--gy', `${(y * 100).toFixed(1)}%`);
      }
      // botones magnéticos
      document.querySelectorAll('.hero .btn, .btn.cta').forEach(b => {
        const r = b.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2, dx = e.clientX - cx, dy = e.clientY - cy, d = Math.hypot(dx, dy);
        if (d < 110) b.style.translate = `${clamp(dx * .22, -9, 9)}px ${clamp(dy * .3, -7, 7)}px`; else b.style.translate = '';
      });
      // portada: las luces se mueven un poco con el cursor
      const h = document.querySelector('.hero');
      if (h) { h.style.setProperty('--mx', ((e.clientX / innerWidth) - .5).toFixed(3)); h.style.setProperty('--my', ((e.clientY / innerHeight) - .5).toFixed(3)); }
    };
    const mv = e => { ev = e; if (!raf) raf = requestAnimationFrame(procesar); };
    const sal = () => { soltar(actual); actual = null; };
    addEventListener('pointermove', mv, { passive: true }); document.addEventListener('pointerleave', sal);
    return () => { removeEventListener('pointermove', mv); document.removeEventListener('pointerleave', sal); cancelAnimationFrame(raf); soltar(actual); };
  }, [clave]);

  // Parallax de la portada al desplazarse
  useEffect(() => {
    if (sinMov()) return;
    let raf = 0;
    const f = () => { raf = 0; const h = document.querySelector('.hero'); if (h) h.style.setProperty('--sy', String(Math.min(scrollY, 900))); };
    const p = () => { if (!raf) raf = requestAnimationFrame(f); };
    addEventListener('scroll', p, { passive: true }); f();
    return () => { removeEventListener('scroll', p); cancelAnimationFrame(raf); };
  }, [clave]);
}

// Número que sube de 0 al valor cuando entra en pantalla
function Contador({ a }) {
  const ref = useRef(null); const [n, setN] = useState(sinMov() ? a : 0);
  useEffect(() => {
    const el = ref.current; if (!el || sinMov()) return;
    let raf = 0;
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return; io.disconnect();
      const t0 = performance.now(), dur = 1500;
      const paso = now => { const k = clamp((now - t0) / dur, 0, 1); setN(Math.round(a * (1 - Math.pow(1 - k, 3)))); if (k < 1) raf = requestAnimationFrame(paso); };
      raf = requestAnimationFrame(paso);
    }, { threshold: .4 });
    io.observe(el); return () => { io.disconnect(); cancelAnimationFrame(raf); };
  }, [a]);
  return <span ref={ref}>{n}</span>;
}

// Cifras que salen de los datos reales del sitio (no se escriben a mano)
export function Cifras() {
  const procs = servicios.reduce((s, x) => s + (x.procedimientos || []).length, 0);
  const lista = [[servicios.length, 'Áreas de atención', 'tooth'], [procs, 'Procedimientos disponibles', 'tools'], [casos.length, 'Casos clínicos', 'smile']];
  return (
    <div className="cifras">
      {lista.map(([n, t, i], k) => (
        <Reveal key={t} className="cifra" delay={k * 110}>
          <span className="cifra-ico"><I n={i} s={28} /></span>
          <span className="cifra-n"><Contador a={n} /></span>
          <span className="cifra-t">{t}</span>
        </Reveal>
      ))}
    </div>
  );
}

// Cinta de servicios que se desplaza sola (se pausa al pasar el cursor)
export function Marquesina() {
  const fila = servicios.map(s => <span key={s.id} className="marq-item"><I n={s.icono} s={18} />{s.titulo}</span>);
  return (
    <div className="marquesina" aria-hidden="true">
      <div className="marq-pista">{fila}{fila}{fila}{fila}</div>
    </div>
  );
}
