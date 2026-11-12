/* PERSONAJE DEL ARCHIVO .GLB (VRoid / anime): carga avatars/asistente.glb y lo anima con la misma interfaz que Asistente3D.
   Usa las expresiones del modelo (A, I, U, E, O, parpadeo, alegría…) para la boca y la cara. */
import * as THREE from 'three';
import { GLTFLoader } from '../../vendor/three/examples/jsm/loaders/GLTFLoader.js';
import { LipsyncEs } from '../../modules/lipsync-es.mjs';

const lerp = (a, b, t) => a + (b - a) * t;
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const suave = (cur, obj, k, dt) => lerp(cur, obj, 1 - Math.exp(-k * dt));

// Qué expresiones del modelo se usan para cada visema (boca)
const VIS = { aa: { A: .9 }, E: { E: .8 }, I: { I: .8 }, O: { O: .85 }, U: { U: .8 }, PP: { Close: .6 }, FF: { Small: .5, I: .2 }, DD: { A: .22, I: .15 }, nn: { A: .18, I: .1 },
  kk: { A: .25 }, SS: { I: .3, Small: .2 }, RR: { O: .25, A: .15 }, CH: { O: .3, I: .15 } };
const MOODS = {
  neutral:  { Fcl_MTH_Fun: .45, Fcl_ALL_Fun: .12 },
  sorpresa: { Fcl_ALL_Surprised: .55, Fcl_MTH_Small: .1 },
  feliz:    { Fcl_MTH_Joy: .55, Fcl_ALL_Fun: .5, Fcl_EYE_Fun: .25 },
  sonrisa:  { Fcl_MTH_Fun: .85, Fcl_ALL_Fun: .3, Fcl_EYE_Fun: .12 },   // sonrisa con la boca cerrada
  pensando: { Fcl_BRW_Surprised: .35, Fcl_MTH_Small: .25, Fcl_ALL_Fun: .0 },
};

// Gestos de brazos (se mezclan suavemente; se ven bien con el modelo de la doctora). ua = brazo, la = antebrazo, h = mano  [x, y, z]
// "I" = brazo izquierdo del personaje (a la derecha de la pantalla).  Se disparan con gesticular('nombre', segundos).
const GESTOS = {
  explicar:  { R: { ua: [0, .3, .6], la: [0, 1.0, -.6], h: [-.6, 0, 0], d: 'abierta' } },
  explicarI: { L: { ua: [0, -.3, -.6], la: [0, -1.0, .6], h: [-.6, 0, 0], d: 'abierta' } },
  presentar: { R: { ua: [0, .3, .7], la: [0, .9, -.5], h: [-.5, 0, 0], d: 'abierta' }, L: { ua: [0, -.3, -.7], la: [0, -.9, .5], h: [-.5, 0, 0], d: 'abierta' } },
  senalarD:  { R: { ua: [0, .6, .3], la: [0, .2, -.2], h: [0, 0, 0], d: 'senalar' } },
  senalarI:  { L: { ua: [0, -.6, -.3], la: [0, -.2, .2], h: [0, 0, 0], d: 'senalar' } },
  asentir:   { cab: 1 }
};
for (let n = 1; n <= 4; n++) {
  GESTOS['contarD' + n] = { R: { ua: [0, .25, .5], la: [0, .45, -1.55], h: [-1.3, 0, 0], d: 'n' + n } };
  GESTOS['contarI' + n] = { L: { ua: [0, -.25, -.5], la: [0, -.45, 1.55], h: [-1.3, 0, 0], d: 'n' + n } };
}

// Dedos: curvatura relajada de cada dedo (articulaciones 1-3, en radianes) y multiplicador por modo. Una mano relajada nunca está plana.
const DEDOS = ['Index', 'Middle', 'Ring', 'Little'];
const RELAJA = { Index: [.10, .20, .12], Middle: [.15, .28, .16], Ring: [.21, .34, .20], Little: [.27, .40, .24] };
const MODO_DEDOS = { relajada: { Index: 1, Middle: 1, Ring: 1, Little: 1, Thumb: 1, abre: 0, onda: .35 }, abierta: { Index: .35, Middle: .4, Ring: .5, Little: .55, Thumb: .3, abre: 1, onda: .6 },
  senalar: { Index: .05, Middle: 3.4, Ring: 3.6, Little: 3.8, Thumb: 2.2, abre: 0, onda: .1 },
  n1: { Index: .05, Middle: 3.4, Ring: 3.6, Little: 3.8, Thumb: 2.4, abre: 0, onda: .15 }, n2: { Index: .05, Middle: .06, Ring: 3.6, Little: 3.8, Thumb: 2.4, abre: .5, onda: .15 },
  n3: { Index: .05, Middle: .06, Ring: .08, Little: 3.8, Thumb: 2.4, abre: .5, onda: .15 }, n4: { Index: .05, Middle: .06, Ring: .08, Little: .1, Thumb: 2.4, abre: .35, onda: .15 }, saludo: { Index: .25, Middle: .3, Ring: .4, Little: .5, Thumb: .2, abre: 1.4, onda: 1.8 } };

export class AsistenteVRM {
  constructor(cont, opc = {}) {
    this.cont = cont; this.opc = opc; this.lip = new LipsyncEs(); this.t = 0; this.activo = false; this.listo = false; this.visible = true;
    const w = cont.clientWidth || 340, h = cont.clientHeight || 400;
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setPixelRatio(Math.min(devicePixelRatio || 1, opc.calidad || 2)); this.renderer.setSize(w, h); this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.domElement.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;display:block'; cont.appendChild(this.renderer.domElement);
    this.scene = new THREE.Scene(); this.cam = new THREE.PerspectiveCamera(opc.fov || 20, w / h, .05, 30);
    this.scene.add(new THREE.AmbientLight(0xffffff, 1.45));
    const key = new THREE.DirectionalLight(0xffffff, .45); key.position.set(-1.5, 2, 3); this.scene.add(key);
    const fill = new THREE.DirectionalLight(0xdfeeff, .5); fill.position.set(2, 0, 2); this.scene.add(fill);
    this.mood = 'neutral'; this.cur = {}; this.pesos = {}; this.pista = null; this.parp = { t: -1, prox: 1.5, v: 0 }; this.puntero = { x: 0, y: 0, t: -99 }; this.azar = { x: 0, y: 0, t: 0 };
    this.estado = { mx: 0, my: 0, habla: 0, saludo: 0 }; this.saludoT = -1; this.ultimo = performance.now(); this.morphs = []; this.huesos = {};
    this._mv = e => { const r = this.renderer.domElement.getBoundingClientRect(); this.puntero.x = clamp((e.clientX - (r.left + r.width / 2)) / (innerWidth * .5), -1, 1); this.puntero.y = clamp((e.clientY - (r.top + r.height * .35)) / (innerHeight * .5), -1, 1); this.puntero.t = this.t; };
    addEventListener('pointermove', this._mv, { passive: true });
    this._ro = new ResizeObserver(() => this.resize()); this._ro.observe(cont);
    this._io = new IntersectionObserver(([en]) => { this.visible = en.isIntersecting; }); this._io.observe(cont);
    this._vc = () => { this.pausa = document.hidden; }; document.addEventListener('visibilitychange', this._vc);
    this.carga = this._cargar(opc.url || 'avatars/asistente.glb');
  }

  async _cargar(url) {
    const gltf = await new GLTFLoader().loadAsync(url); this.modelo = gltf.scene; this.scene.add(this.modelo);
    // El modelo VRoid usa materiales "MToon": se pasan a materiales de caricatura de three.js
    const conv = m => { if (!m.map) return m; const n = new THREE.MeshToonMaterial({ map: m.map, color: m.color, alphaTest: m.alphaTest, transparent: m.transparent, side: m.side, opacity: m.opacity, depthWrite: m.depthWrite }); m.dispose(); return n; };
    this.modelo.traverse(o => {
      if (o.isMesh || o.isSkinnedMesh) { o.frustumCulled = false; if (/Onepiece/.test([].concat(o.material).map(m => m.name).join())) o.visible = false;   // anillos del modelo: se ven como manchas negras en la mano
      o.material = Array.isArray(o.material) ? o.material.map(conv) : conv(o.material); }
      if (o.isMesh && o.morphTargetDictionary) this.morphs.push(o);
      if (o.isBone || /^J_(Bip|Adj)/.test(o.name)) this.huesos[o.name] = o;
    });
    const H = this.huesos;
    // El modelo viene con los brazos en cruz (T): se bajan a los costados
    this.base = {}; for (const k in H) this.base[k] = H[k].quaternion.clone();
    this.pose = { L: H.J_Bip_L_UpperArm, R: H.J_Bip_R_UpperArm, LL: H.J_Bip_L_LowerArm, RL: H.J_Bip_R_LowerArm };
    this.modelo.updateMatrixWorld(true);
    const cab = new THREE.Vector3(); (H.J_Bip_C_Head || this.modelo).getWorldPosition(cab); this.cabPos = cab;
    this.resize(); this.listo = true; this.cam.lookAt(this.objetivo);
  }

  resize() {
    const w = this.cont.clientWidth, h = this.cont.clientHeight; if (!w || !h) return;
    this.renderer.setSize(w, h, false); this.cam.aspect = w / h;
    if (this.cabPos) {   // encuadre: busto, con la cabeza arriba
      const altoVisible = (this.opc.encuadre ?? .46) / Math.min(1, (w / h) / .8), dist = altoVisible / 2 / Math.tan(THREE.MathUtils.degToRad(this.cam.fov / 2));
      this.objetivo = new THREE.Vector3(this.cabPos.x, this.cabPos.y - (this.opc.baja ?? -.0), 0);
      this.dist = dist; this._camara(this.estado ? this.estado.saludo : 0);
    }
    this.cam.updateProjectionMatrix(); this.render();
  }

  _camara(s) {   // al saludar la cámara se aleja un poco para que se vea la mano, y vuelve
    if (!this.objetivo) return; const k = 1 + (this.opc.saludoZoom ?? .5) * s;
    const px = this.objetivo.x - (this.opc.saludoPan ?? .12) * s, py = this.objetivo.y + (this.opc.saludoY ?? .05) * s; this.cam.position.set(px, py, this.cabPos.z + this.dist * k + .02); this.cam.lookAt(px, py, 0);
  }

  setMood(n) { this.mood = MOODS[n] ? n : 'neutral'; }
  vestir() {}
  saludar() { this.saludoT = this.t; }
  gesticular(n, dur = 2.6) { const g = GESTOS[n]; if (!g) return; this.gesto = { n, t0: this.t, fin: this.t + dur }; this.gp = this.gp || {}; if (g.R) this.gp.R = g.R; if (g.L) this.gp.L = g.L; }
  reaccionar() { this.guino = 0; this.mood = 'feliz'; this.saludar(); }   // clic en el avatar: guiño y sonrisa
  hablar({ palabras, tiempos, duraciones }) {
    const pista = [];
    palabras.forEach((w, i) => {
      const r = this.lip.wordsToVisemes(this.lip.preProcessText(w.replace(/[¿¡?!.,;:()"]/g, '')) || ''); if (!r.visemes.length) return;
      const total = r.times[r.times.length - 1] + r.durations[r.durations.length - 1], k = duraciones[i] / total;
      r.visemes.forEach((v, j) => pista.push({ v, t0: tiempos[i] + r.times[j] * k, t1: tiempos[i] + (r.times[j] + r.durations[j]) * k }));
    });
    this.pista = { lista: pista, inicio: performance.now(), tiempos, fin: Math.max(...pista.map(p => p.t1), 0) + 250 };
    if (this.opc.saludoAuto !== false && (this.saludoT < 0 || this.t - this.saludoT > 5)) this.saludar();
  }
  palabra(i) { if (this.pista && this.pista.tiempos[i] != null) this.pista.inicio = performance.now() - this.pista.tiempos[i]; }
  detener() { this.pista = null; }
  get hablando() { return !!this.pista; }

  start() { if (this.activo) return; this.activo = true; this.ultimo = performance.now(); const f = n => { if (!this.activo) return; this._raf = requestAnimationFrame(f); if (this.visible && !this.pausa && this.listo) this.frame(n); }; this._raf = requestAnimationFrame(f); }
  stop() { this.activo = false; cancelAnimationFrame(this._raf); }
  dispose() { this.stop(); removeEventListener('pointermove', this._mv); this._ro.disconnect(); this._io.disconnect(); document.removeEventListener('visibilitychange', this._vc); this.renderer.dispose(); this.renderer.domElement.remove(); }
  render() { this.renderer.render(this.scene, this.cam); }

  _rot(nombre, x = 0, y = 0, z = 0) {   // gira un hueso desde su pose original
    const h = this.huesos[nombre]; if (!h) return; const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(x, y, z)); h.quaternion.copy(this.base[nombre]).multiply(q);
  }
  _poner(nombre, v) { for (const m of this.morphs) { const i = m.morphTargetDictionary[nombre]; if (i !== undefined) m.morphTargetInfluences[i] = clamp(v, 0, 1); } }

  frame(now) {
    const dt = Math.min(.05, (now - this.ultimo) / 1000); this.ultimo = now; this.t += dt; const t = this.t, e = this.estado;
    // --- expresiones: se mezclan suavemente hacia el ánimo actual ---
    const meta = {}; const M = MOODS[this.mood]; for (const k in M) meta[k] = M[k];
    let v = null; const P = this.pista;
    if (P) { const ms = now - P.inicio; if (ms > P.fin) this.pista = null; else for (const p of P.lista) { if (ms >= p.t0 && ms < p.t1) { v = p; break; } if (p.t0 > ms) break; } }
    e.habla = suave(e.habla, this.pista ? 1 : 0, 6, dt);
    if (e.habla > .01) { meta.Fcl_MTH_Fun = (meta.Fcl_MTH_Fun || 0) * (1 - e.habla * .85); meta.Fcl_MTH_Joy = (meta.Fcl_MTH_Joy || 0) * (1 - e.habla * .85); }
    if (v) { const w = VIS[v.v] || { A: .25 }; for (const k in w) meta['Fcl_MTH_' + k] = w[k] * (.9 + .1 * Math.sin(t * 17)); }
    if (this.parp.t < 0 && t > this.parp.prox) { this.parp.t = 0; this.parp.prox = t + (Math.random() < .18 ? .32 : 2.2 + Math.random() * 3.2); }
    let cierra = 0; if (this.parp.t >= 0) { this.parp.t += dt; const p = this.parp.t / .2; cierra = p < .4 ? p / .4 : Math.max(0, 1 - (p - .4) / .6); if (p >= 1) this.parp.t = -1; }
    meta.Fcl_EYE_Close = Math.max(meta.Fcl_EYE_Close || 0, cierra);
    // gestos espontáneos: de vez en cuando levanta las cejas o sonríe más; el clic provoca un guiño
    if (this.micro === undefined) { this.micro = -1; this.proxMicro = t + 5; }
    if (this.micro < 0 && t > this.proxMicro && !this.pista) { this.micro = 0; this.tipoMicro = Math.random() < .5; this.proxMicro = t + 6 + Math.random() * 5; }
    if (this.micro >= 0) { this.micro += dt; const q = Math.sin(clamp(this.micro / 1.6, 0, 1) * Math.PI); if (this.tipoMicro) { meta.Fcl_BRW_Fun = .7 * q; } else { meta.Fcl_MTH_Joy = (meta.Fcl_MTH_Joy || 0) + .35 * q; meta.Fcl_EYE_Fun = .3 * q; } if (this.micro > 1.6) this.micro = -1; }
    if (this.guino !== undefined && this.guino >= 0) { this.guino += dt; const q = Math.sin(clamp(this.guino / .9, 0, 1) * Math.PI); meta.Fcl_EYE_Close_R = q; meta.Fcl_MTH_Joy = Math.max(meta.Fcl_MTH_Joy || 0, .6 * q); if (this.guino > 1.8) { this.guino = -1; this.mood = 'neutral'; } }
    // naturalidad al hablar: cada 1-3 s hace un énfasis (cejas arriba, sonrisa con ojos, o ceja suave) y la cabeza lo acompaña
    if (this.enf === undefined) { this.enf = -1; this.proxEnf = t + 1.2; this.tipoEnf = 0; }
    if (this.pista && this.enf < 0 && t > this.proxEnf) { this.enf = 0; this.tipoEnf = Math.floor(Math.random() * 3); this.proxEnf = t + 1.3 + Math.random() * 1.9; }
    let qe = 0; if (this.enf >= 0) { this.enf += dt; qe = Math.sin(clamp(this.enf / 1.0, 0, 1) * Math.PI); if (this.enf > 1.0) this.enf = -1; }
    this._qe = suave(this._qe || 0, qe, 12, dt);
    if (qe > 0) { if (this.tipoEnf === 0) { meta.Fcl_BRW_Surprised = Math.max(meta.Fcl_BRW_Surprised || 0, .5 * qe); meta.Fcl_EYE_Surprised = .12 * qe; } else if (this.tipoEnf === 1) { meta.Fcl_BRW_Fun = Math.max(meta.Fcl_BRW_Fun || 0, .6 * qe); meta.Fcl_EYE_Fun = Math.max(meta.Fcl_EYE_Fun || 0, .35 * qe); meta.Fcl_MTH_Joy = (meta.Fcl_MTH_Joy || 0) + .12 * qe; } else { meta.Fcl_BRW_Joy = .5 * qe; meta.Fcl_EYE_Joy = .15 * qe; } }
    meta.Fcl_BRW_Fun = (meta.Fcl_BRW_Fun || 0) + e.habla * (.12 + .08 * Math.sin(t * .9));   // las cejas nunca quedan quietas al hablar
    const todos = new Set([...Object.keys(this.pesos), ...Object.keys(meta)]);
    for (const k of todos) { this.pesos[k] = suave(this.pesos[k] || 0, meta[k] || 0, k === 'Fcl_EYE_Close' ? 45 : (k.startsWith('Fcl_MTH_') && v ? 28 : 10), dt); this._poner(k, this.pesos[k]); }

    // --- gestos de brazos: pesos suaves por lado ---
    const G = this.gesto && this.t < this.gesto.fin ? GESTOS[this.gesto.n] : null, gk = this.gk || (this.gk = { R: 0, L: 0, cab: 0 });
    for (const l of ['R', 'L']) gk[l] = suave(gk[l], G && G[l] ? 1 : 0, G && G[l] ? 5 : 4, dt);
    gk.cab = suave(gk.cab, G && G.cab ? 1 : 0, 6, dt); const nod = G && G.cab ? gk.cab * Math.sin((this.t - this.gesto.t0) * 7.5) * .11 : 0;
    // --- gestos automáticos (al hablar y en reposo) e inclinación de cabeza ---
    if (this.opc.autoGestos !== false && t > (this.agT || 0) && !(this.gesto && t < this.gesto.fin) && !(this.saludoT >= 0 && t - this.saludoT < 5)) {
      const hab = !!this.pista, L = hab ? ['explicar', 'explicarI', 'asentir', 'presentar', 'explicarI', 'asentir'] : ['explicar', 'explicarI'];
      this.gesticular(L[Math.floor(Math.random() * L.length)], hab ? 2.2 : 1.8); this.agT = t + (hab ? 1.2 + Math.random() * 1.8 : 7 + Math.random() * 7);
    }
    if (!this.inc || t > this.inc.t) this.inc = { r: (Math.random() - .5) * (this.pista ? .26 : .34), p: (Math.random() - .5) * .08, t: t + 2 + Math.random() * 3.5 };
    this.ir = suave(this.ir || 0, this.inc.r, 2.2, dt); this.ip = suave(this.ip || 0, this.inc.p, 2.2, dt);
    // --- mirada y cabeza ---
    if (t - this.azar.t > 2.4) this.azar = { x: (Math.random() - .5) * 1.1, y: (Math.random() - .5) * .5, t };
    const usaP = t - this.puntero.t < 4, mx = usaP ? this.puntero.x : this.azar.x, my = usaP ? -this.puntero.y : this.azar.y;
    e.mx = suave(e.mx, mx, 8, dt); e.my = suave(e.my, my, 8, dt);
    const yaw = e.mx * .32 + Math.sin(t * .6) * .03, pit = nod + this.ip - e.my * .16 + Math.sin(t * .8) * .02 + e.habla * (Math.sin(t * 4.3) * .03 + Math.sin(t * 2.1) * .02);
    const qh = this._qe || 0, roll = qh * (this.tipoEnf === 1 ? .06 : -.045); this._rot('J_Bip_C_Neck', (pit + qh * .02) * .4, yaw * .4, roll * .4 + this.ir * .3); this._rot('J_Bip_C_Head', (pit - qh * .035) * .6, yaw * .6 + qh * .03, roll * .6 + this.ir * .7 + e.saludo * .1 + Math.sin(t * .5) * .02 + e.habla * Math.sin(t * 2.6) * .025);
    if (!this.sac || t > this.sac.t) this.sac = { x: (Math.random() - .5) * .06, y: (Math.random() - .5) * .04, t: t + .5 + Math.random() * 1.1 };   // movimientos finitos de los ojos
    this.sx = suave(this.sx || 0, this.sac.x, 30, dt); this.sy = suave(this.sy || 0, this.sac.y, 30, dt);
    this._rot('J_Adj_L_FaceEye', -e.my * .12 + this.sy, e.mx * .18 + this.sx, 0); this._rot('J_Adj_R_FaceEye', -e.my * .12 + this.sy, e.mx * .18 + this.sx, 0);
    // --- cuerpo: respiración y brazos relajados (el derecho saluda) ---
    this._rot('J_Bip_C_Chest', Math.sin(t * 1.5) * .012, 0, 0); this._rot('J_Bip_C_Spine', 0, yaw * .15, Math.sin(t * .45) * .01 + e.habla * Math.sin(t * 1.1) * .014);   // balanceo suave del torso
    this._rot('J_Bip_L_Shoulder', 0, 0, Math.sin(t * 1.5) * .012 - qh * .02); this._rot('J_Bip_R_Shoulder', 0, 0, -Math.sin(t * 1.5 + .4) * .012 + qh * .02);
    const sT = this.saludoT >= 0 ? this.t - this.saludoT : -1, dur = 3.4; let w = 0; if (sT >= 0 && sT < dur) w = Math.sin(clamp(sT / dur, 0, 1) * Math.PI) ** .6; else if (sT >= dur) this.saludoT = -1;
    e.saludo = suave(e.saludo, w, 12, dt); const s = e.saludo, bal = Math.sin(t * 9) * .3, A = this.opc.brazo ?? 1.2;
    const mezcla = (base, pose, w) => pose && w > .002 ? base.map((r, i) => lerp(r, pose[i], w)) : base, vida = Math.sin(t * 3.3) * .05;
    const wR = gk.R * (1 - s), wL = gk.L, pR = this.gp && this.gp.R, pL = this.gp && this.gp.L, LW = this.opc.saludoL || [0, 0, -1.9];
    const uaL = mezcla([0, 0, -A + Math.sin(t * 1.5) * .01], pL && pL.ua, wL), laL = mezcla([0, 0, 0], pL && pL.la, wL), hL = mezcla([0, 0, 0], pL && pL.h, wL);
    const uaR = mezcla([(this.opc.saludoAx ?? 0) * s, (this.opc.saludoAy ?? 0) * s, lerp(A, this.opc.saludoA ?? -.1, s) + Math.sin(t * 1.5 + 1) * .01 * (1 - s)], pR && pR.ua, wR);
    const laR = mezcla([LW[0] * s, LW[1] * s, LW[2] * s + bal * s], pR && pR.la, wR), hR = mezcla([(this.opc.saludoMano ?? -1.5) * s, 0, bal * .6 * s], pR && pR.h, wR);
    this._rot('J_Bip_L_UpperArm', ...uaL); this._rot('J_Bip_L_LowerArm', laL[0], laL[1], laL[2] + vida * wL); this._rot('J_Bip_L_Hand', ...hL);
    this._rot('J_Bip_R_UpperArm', ...uaR); this._rot('J_Bip_R_LowerArm', laR[0], laR[1], laR[2] - vida * wR); this._rot('J_Bip_R_Hand', ...hR);
    // --- dedos: relajados, con vida propia y abiertos/señalando según el gesto ---
    this.fd = this.fd || { R: { Index: 1, Middle: 1, Ring: 1, Little: 1, Thumb: 1, abre: 0, onda: .35 }, L: { Index: 1, Middle: 1, Ring: 1, Little: 1, Thumb: 1, abre: 0, onda: .35 } };
    for (const lado of ['R', 'L']) {
      const pose = lado === 'R' ? pR : pL, gw = lado === 'R' ? wR : wL; let modo = 'relajada';
      if (lado === 'R' && s > .15) modo = 'saludo'; else if (pose && gw > .35) modo = pose.d || 'abierta';
      const M = MODO_DEDOS[modo], F = this.fd[lado]; for (const k in M) F[k] = suave(F[k], M[k], 9, dt);
      const sg = lado === 'R' ? 1 : -1;   // la mano izquierda es el espejo de la derecha
      DEDOS.forEach((f, i) => {
        const ph = i * .9 + (lado === 'R' ? 0 : 1.7), viva = Math.sin(t * (.8 + i * .17) + ph) * .045 + Math.sin(t * 5.2 + ph) * .05 * F.onda * (F.onda > .5 ? 1 : 0);
        for (let j = 1; j <= 3; j++) this._rot(`J_Bip_${lado}_${f}${j}`, 0, j === 1 ? sg * F.abre * ([-.10, -.02, .07, .14][i]) : 0, sg * (RELAJA[f][j - 1] * F[f] + viva * (j === 1 ? .8 : .5)));
      });
      for (let j = 1; j <= 3; j++) this._rot(`J_Bip_${lado}_Thumb${j}`, 0, 0, sg * ([.08, .14, .10][j - 1] * F.Thumb + Math.sin(t * .9 + (lado === 'R' ? 0 : 2)) * .02));
    }
    this._rot('J_Bip_C_UpperChest', 0, 0, s * Math.sin(t * 6) * .02);
    this._camara(s);
    this.render();
  }
}
