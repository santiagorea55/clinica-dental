/* Efectos de ambiente (suaves): burbujas de fondo, luz que sigue al cursor, desvanecido al desplazarse,
   destello en tarjetas y ligera inclinación de la imagen de portada. Nada de esto mueve el diseño de lugar. */
import { useEffect, useRef } from 'react';

const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const menosMov = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

// Dientes, cepillos, espejos dentales y destellos que flotan despacio, con paralaje al hacer scroll; se apartan del cursor
const DIENTE = new Path2D('M0 -.55 C.25 -.85 .9 -.8 .9 -.15 C.9 .35 .55 .45 .5 .95 C.46 1.2 .22 1.2 .18 .8 C.14 .5 -.14 .5 -.18 .8 C-.22 1.2 -.46 1.2 -.5 .95 C-.55 .45 -.9 .35 -.9 -.15 C-.9 -.8 -.25 -.85 0 -.55Z');
const BRILLO = new Path2D('M0 -1 Q.12 -.12 1 0 Q.12 .12 0 1 Q-.12 .12 -1 0 Q-.12 -.12 0 -1Z');
const FORMAS = [
  g => { g.fill(DIENTE); g.stroke(DIENTE); },
  g => { const m = new Path2D(); m.rect(-1, -.13, 1.4, .26); m.rect(.35, -.22, .65, .44); for (let i = 0; i < 4; i++) m.rect(.42 + i * .17, -.55, .09, .35); g.fill(m); g.stroke(m); },   // cepillo
  g => { g.fill(BRILLO); g.stroke(BRILLO); },
  g => { const m = new Path2D(); m.arc(.4, -.4, .5, 0, 6.3); const h = new Path2D(); h.moveTo(.05, -.05); h.lineTo(-.95, .95); g.fill(m); g.stroke(m); g.save(); g.lineWidth *= 2.2; g.lineCap = 'round'; g.stroke(h); g.restore(); },   // espejo dental
  g => { const m = new Path2D('M0 -1 L.85 -.55 L.85 .1 C.85 .6 .4 .9 0 1 C-.4 .9 -.85 .6 -.85 .1 L-.85 -.55Z'); g.fill(m); g.stroke(m); g.save(); g.lineWidth *= 1.6; g.beginPath(); g.moveTo(-.35, 0); g.lineTo(-.05, .3); g.lineTo(.4, -.3); g.stroke(); g.restore(); },   // escudo con palomita
];
// Ajustes en js/config.js (CONFIG_FONDO): cantidad y "peso" de cada figura (0 = no aparece)
const NOMBRES = ['diente', 'cepillo', 'brillo', 'espejo', 'escudo'];
function pesos() { const c = window.CONFIG_FONDO || {}, p = c.figuras || {}; return NOMBRES.map(n => Math.max(0, p[n] ?? 1)); }
function elegir() { const w = pesos(), t = w.reduce((a, b) => a + b, 0) || 1; let r = Math.random() * t; for (let i = 0; i < w.length; i++) { r -= w[i]; if (r <= 0) return i; } return 0; }
export function Burbujas() {
  const ref = useRef(null), lejosRef = useRef(null);
  useEffect(() => {
    const cv = ref.current; if (!cv || !lejosRef.current || menosMov()) return;
    const gN = cv.getContext('2d'), gL = lejosRef.current.getContext('2d'); let W = 0, H = 0, raf = 0, ult = performance.now(); const mouse = { x: -999, y: -999 };
    const dpr = Math.min(devicePixelRatio || 1, 2);
    const nuevo = (ini) => { const r = 7 + Math.pow(Math.random(), 1.5) * 45, p = (r - 7) / 45;   // p = qué tan cerca está (0 lejos · 1 cerca)
      return { x: Math.random() * W, y: ini ? Math.random() * H : H + 60, r, v: 5 + p * 40, ph: Math.random() * 6.3, z: .3 + p, a: .1 + Math.random() * .1, f: elegir(), rot: (Math.random() - .5) * 1.2, vr: (Math.random() - .5) * .35 * (.4 + p) }; };
    let bs = [];
    const med = () => { W = innerWidth; H = innerHeight; for (const c of [cv, lejosRef.current]) { c.width = W * dpr; c.height = H * dpr; c.getContext('2d').setTransform(dpr, 0, 0, dpr, 0, 0); } const n = clamp(Math.round(((window.CONFIG_FONDO || {}).cantidad ?? 14) * W / 1280), 3, 60); bs = Array.from({ length: n }, () => nuevo(true)); };
    med();
    const mv = e => { mouse.x = e.clientX; mouse.y = e.clientY; };
    const f = now => {
      raf = requestAnimationFrame(f); if (document.hidden) return;
      const dt = Math.min(.05, (now - ult) / 1000); ult = now; gN.clearRect(0, 0, W, H); gL.clearRect(0, 0, W, H); const sc = scrollY;
      for (const b of bs) {
        b.y -= b.v * dt * b.z; b.ph += dt * .6; b.x += Math.sin(b.ph) * 8 * dt; b.rot += b.vr * dt;
        const dx = b.x - mouse.x, dy = (b.y - sc * .12 * b.z) - mouse.y, d = Math.hypot(dx, dy);
        if (d < 120) { const k = (1 - d / 120) * 70 * dt; b.x += dx / (d || 1) * k; b.y += dy / (d || 1) * k; }
        if (b.y < -40) Object.assign(b, nuevo(false));
        const g = b.r < 20 ? gL : gN;   // las lejanas van en una capa desenfocada
        g.save(); g.translate(b.x, b.y - sc * .12 * b.z); g.rotate(b.rot + Math.sin(b.ph) * .15); g.scale(b.r, b.r);
        g.fillStyle = `rgba(108,180,216,${b.a * 1.7})`; g.strokeStyle = `rgba(40,120,168,${b.a * 3.6})`; g.lineWidth = 1.6 / b.r; g.lineJoin = 'round';
        FORMAS[b.f](g); g.restore();
      }
    };
    raf = requestAnimationFrame(f); addEventListener('resize', med); addEventListener('pointermove', mv, { passive: true });
    return () => { cancelAnimationFrame(raf); removeEventListener('resize', med); removeEventListener('pointermove', mv); };
  }, []);
  return <><canvas ref={lejosRef} className="burbujas lejos" /><canvas ref={ref} className="burbujas" /></>;
}

// Todo lo que reacciona al puntero o al scroll, en un solo lugar
export function useEfectosGlobales(clave) {
  // Luz suave que sigue al cursor + brillo en tarjetas + inclinación de portada
  useEffect(() => {
    if (menosMov()) return;
    const luz = document.querySelector('.luz'); let tx = innerWidth / 2, ty = innerHeight / 3, x = tx, y = ty, raf = 0;
    const anim = () => { raf = requestAnimationFrame(anim); x += (tx - x) * .08; y += (ty - y) * .08; if (luz) luz.style.transform = `translate(${x - 280}px, ${y - 280}px)`; };
    anim();
    const mv = e => {
      tx = e.clientX; ty = e.clientY;
      const c = e.target.closest && e.target.closest('.card, .box');
      if (c) { const r = c.getBoundingClientRect(); c.style.setProperty('--mx', `${e.clientX - r.left}px`); c.style.setProperty('--my', `${e.clientY - r.top}px`); }
      const h = document.querySelector('.hero-image-container');
      if (h) { const r = h.getBoundingClientRect(), nx = clamp((e.clientX - (r.left + r.width / 2)) / innerWidth, -.5, .5), ny = clamp((e.clientY - (r.top + r.height / 2)) / innerHeight, -.5, .5);
        h.style.setProperty('--ry', `${nx * 9}deg`); h.style.setProperty('--rx', `${-ny * 9}deg`); }
    };
    addEventListener('pointermove', mv, { passive: true });
    return () => { cancelAnimationFrame(raf); removeEventListener('pointermove', mv); };
  }, []);

  // Desvanecido progresivo: cada bloque se aclara al entrar por abajo y se apaga suave al salir por arriba
  useEffect(() => {
    let raf = 0;
    const suav = t => t * t * (3 - 2 * t);
    const calc = () => {
      raf = 0; const vh = innerHeight, root = document.documentElement; root.style.setProperty('--scroll', String(scrollY));
      if (menosMov()) return;
      // velo global: toda la página se desvanece hacia arriba y hacia abajo según hasta dónde se ha scrolleado
      const tope = Math.max(1, root.scrollHeight - vh), a = clamp(scrollY / (vh * .35), 0, 1), b = clamp((tope - scrollY) / (vh * .35), 0, 1);
      root.style.setProperty('--va', suav(a).toFixed(3)); root.style.setProperty('--vb', suav(b).toFixed(3));
      document.querySelectorAll('main > *').forEach(el => {
        const r = el.getBoundingClientRect();
        const ent = suav(clamp((vh - r.top) / (vh * .22), 0, 1)), sal = suav(clamp((r.bottom - 80) / (vh * .3), 0, 1));
        el.style.setProperty('--sf', Math.min(ent, sal).toFixed(3));
        el.style.setProperty('--sy', `${((1 - ent) * 26 - (1 - sal) * 16).toFixed(1)}px`);
      });
    };
    const pide = () => { if (!raf) raf = requestAnimationFrame(calc); };
    addEventListener('scroll', pide, { passive: true }); addEventListener('resize', pide); addEventListener('load', pide);
    const ro = new ResizeObserver(pide); const m = document.querySelector('main'); if (m) ro.observe(m);
    const t = [60, 300, 900].map(ms => setTimeout(pide, ms)); pide();
    return () => { removeEventListener('scroll', pide); removeEventListener('resize', pide); removeEventListener('load', pide); ro.disconnect(); t.forEach(clearTimeout); cancelAnimationFrame(raf); };
  }, [clave]);
}
