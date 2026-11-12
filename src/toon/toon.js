/* ASISTENTE 3D ANIMADO (estilo caricatura) — personaje construido con three.js, sin archivos externos.
   Cabeza grande, ojos brillantes, cejas y boca expresivas, parpadeo, sincronía labial en español, saludo con la mano.
   API:  new Asistente3D(contenedor, opciones) · setMood('neutral'|'feliz'|'pensando') · hablar({palabras,tiempos,duraciones}) · detener() · saludar() · vestir('#hex') */
import * as THREE from 'three';
import { RoomEnvironment } from '../../vendor/three/examples/jsm/environments/RoomEnvironment.js';
import { LipsyncEs } from '../../modules/lipsync-es.mjs';

const lerp = (a, b, t) => a + (b - a) * t;
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const suave = (cur, obj, k, dt) => lerp(cur, obj, 1 - Math.exp(-k * dt));   // acercamiento exponencial (independiente de los fps)

// Colores
const COL = { piel: 0xf0b995, pielSombra: 0xe7a98a, labio: 0xe0707f, boca: 0x5a1f2c, lengua: 0xe8808c, pelo: 0x7a4a2c, iris: 0x6a4025, iris2: 0x3a2113,
  uniforme: 0x2f9e8f, borde: 0x6fd0c0, oro: 0xf2c46b, mejilla: 0xff8f96 };

// Boca: tiras de triángulos entre dos curvas (labio superior / inferior), pegadas a la superficie de la cara
class Tira {
  constructor(mat, n, orden) {
    this.n = n; this.pos = new Float32Array((n + 1) * 2 * 3);
    const g = new THREE.BufferGeometry(), idx = [];
    for (let i = 0; i < n; i++) { const a = i * 2; idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); }
    g.setIndex(idx); g.setAttribute('position', new THREE.BufferAttribute(this.pos, 3));
    const nn = new Float32Array((n + 1) * 2 * 3); for (let i = 2; i < nn.length; i += 3) nn[i] = 1; g.setAttribute('normal', new THREE.BufferAttribute(nn, 3));
    this.mesh = new THREE.Mesh(g, mat); this.mesh.renderOrder = orden; this.mesh.frustumCulled = false;
  }
  punto(i, k, x, y, z) { const o = (i * 2 + k) * 3; this.pos[o] = x; this.pos[o + 1] = y; this.pos[o + 2] = z; }
  listo() { this.mesh.geometry.attributes.position.needsUpdate = true; }
}

const MOODS = {
  neutral:  { sonrisa: .62, ceja: 0,   inclina: 0,   parp: 2.45, mejilla: .25, dientes: 0,  mirarX: 0,   mirarY: 0,   cabezaZ: 0 },
  feliz:    { sonrisa: .95, ceja: .45, inclina: .05, parp: 2.25, mejilla: .75, dientes: 1,  mirarX: 0,   mirarY: 0,   cabezaZ: .05 },
  pensando: { sonrisa: .05, ceja: .75, inclina: .35, parp: 2.4,  mejilla: .15, dientes: 0,  mirarX: .6,  mirarY: .65, cabezaZ: -.09 },
};

export class Asistente3D {
  constructor(cont, opc = {}) {
    this.cont = cont; this.opc = opc;
    this.lip = new LipsyncEs();
    const w = cont.clientWidth || 340, h = cont.clientHeight || 400;
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, opc.calidad || 2));
    this.renderer.setSize(w, h); this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.domElement.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;display:block';
    cont.appendChild(this.renderer.domElement);
    this.scene = new THREE.Scene();
    this.cam = new THREE.PerspectiveCamera(opc.fov || 25, w / h, .1, 60);
    this.cam.position.set(0, opc.camY ?? -0.4, opc.camZ ?? 8.3); this.cam.lookAt(0, opc.camY ?? -0.4, 0);
    this.mood = 'neutral'; this.cur = { ...MOODS.neutral };
    this.estado = { abierto: 0, ancho: 1, redondo: 0, labios: 0, parpadeo: 0, mx: 0, my: 0, habla: 0, saludo: 0 };
    this.obj = { abierto: 0, ancho: 1, redondo: 0, labios: 0 };
    this.puntero = { x: 0, y: 0, t: -99 }; this.azar = { x: 0, y: 0, t: 0 };
    this.proxParp = 1.5; this.parpT = -1; this.t = 0; this.pista = null; this.saludoT = -1; this.vivo = true;
    this._luces(); this._construir();
    this._eventos();
    this.resize();
    this.ultimo = performance.now(); this.activo = false;
  }

  /* ---------- Escena ---------- */
  _luces() {
    const s = this.scene;
    // Reflejos suaves de estudio (da brillo al cabello, ojos y piel)
    const pm = new THREE.PMREMGenerator(this.renderer); s.environment = pm.fromScene(new RoomEnvironment(), .04).texture; s.environmentIntensity = .32;
    s.add(new THREE.HemisphereLight(0xffffff, 0xd6e6f0, .45));
    const key = new THREE.DirectionalLight(0xfff1e2, 2.0); key.position.set(-3, 4, 6); s.add(key);
    const fill = new THREE.DirectionalLight(0xcfe6ff, .55); fill.position.set(4, 0, 4); s.add(fill);
    const rim = new THREE.DirectionalLight(0xbfeee6, .4); rim.position.set(2, 3, -5); s.add(rim);
  }

  _mat(color, rough = .6, extra = {}) { return new THREE.MeshStandardMaterial({ color, roughness: rough, metalness: 0, ...extra }); }
  _fis(color, rough = .5, extra = {}) { return new THREE.MeshPhysicalMaterial({ color, roughness: rough, metalness: 0, ...extra }); }

  _construir() {
    this.m = {
      piel: this._fis(COL.piel, .55, { sheen: .35, sheenColor: new THREE.Color(0xff9d8a), sheenRoughness: .55, clearcoat: .08, clearcoatRoughness: .5 }),
      pielS: this._fis(COL.pielSombra, .65, { sheen: .6, sheenColor: new THREE.Color(0xff9d8a) }),
      pelo: this._fis(COL.pelo, .5, { clearcoat: .08, clearcoatRoughness: .5, sheen: .5, sheenColor: new THREE.Color(0xc9884f), sheenRoughness: .4 }),
      uni: this._fis(COL.uniforme, .75, { sheen: .15, sheenColor: new THREE.Color(0x9fe8dc), sheenRoughness: .6 }), borde: this._mat(COL.borde, .6),
      blanco: this._mat(0xffffff, .35), oro: this._mat(COL.oro, .3, { metalness: .6 }),
      marco: this._fis(0x1c2638, .3, { clearcoat: .6 }), gris: this._fis(0xdfe6ec, .35, { clearcoat: .4 }),
    };
    this.raiz = new THREE.Group(); this.scene.add(this.raiz);
    this.cuerpo = new THREE.Group(); this.raiz.add(this.cuerpo);
    this._torso(); this._brazos();
    this.cabeza = new THREE.Group(); this.cabeza.position.set(0, -.92, 0); this.raiz.add(this.cabeza);
    this.cara = new THREE.Group(); this.cara.position.y = .92; this.cabeza.add(this.cara);
    this._cabeza(); this._pelo(); this._ojos(); this._cejas(); this._nariz(); this._mejillas(); this._boca(); this._accesorios();
  }

  /* superficie del cráneo: elipsoide con mentón más fino (forma de corazón suave) */
  get R() { return { x: 1.02, y: .99, z: .96 }; }
  taper(yu) { const t = clamp((.1 - yu) / 1.05, 0, 1); return 1 - .24 * t * t * (3 - 2 * t); }
  zCara(x, y) { const R = this.R, yu = y / R.y, xu = x / (R.x * this.taper(yu)); return R.z * Math.sqrt(Math.max(0, 1 - xu * xu - yu * yu)); }
  pegar(obj, x, y, desde = 0, orientar = true) {
    const R = this.R, z = this.zCara(x, y), t = this.taper(y / R.y); obj.position.set(x, y, z + desde);
    if (orientar) { const n = new THREE.Vector3(x / (R.x * t) ** 2, y / R.y ** 2, z / R.z ** 2).normalize(); obj.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), n); }
    return obj;
  }

  // Cadena de esferas a lo largo de una curva (mechones, trenza): da formas suaves y voluminosas
  cadena(pts, r0, r1, mat, grupo, paso = .06, aplasta = 1) {
    const curva = new THREE.CatmullRomCurve3(pts.map(p => new THREE.Vector3(...p))), n = Math.ceil(curva.getLength() / paso), geo = new THREE.SphereGeometry(1, 20, 14);
    for (let i = 0; i <= n; i++) { const u = i / n, m = new THREE.Mesh(geo, mat), r = lerp(r0, r1, u); m.position.copy(curva.getPoint(u)); m.scale.set(r, r * aplasta, r); grupo.add(m); }
  }

  _torso() {
    // Cuerpo con forma de bata/uniforme (lathe suavizado) + cuello
    const perfil = new THREE.SplineCurve([[.30, -1.0], [.5, -1.1], [.92, -1.3], [1.12, -1.55], [1.1, -2.0], [1.04, -2.6], [1.0, -3.3]].map(p => new THREE.Vector2(...p))).getPoints(48);
    this.torso = new THREE.Mesh(new THREE.LatheGeometry(perfil, 64), this.m.uni);
    this.torso.scale.set(1.04, 1, .6); this.cuerpo.add(this.torso);
    const cuello = new THREE.Mesh(new THREE.CylinderGeometry(.27, .31, .6, 28), this.m.pielS); cuello.position.y = -.98; this.cuerpo.add(cuello);
    this.cuerpo.updateMatrixWorld(true);
    this._escote(); this._insignias();
  }

  // Raycast hacia el torso para pegar detalles sobre su superficie
  _enTorso(x, y, desde = .012) {
    const rc = new THREE.Raycaster(new THREE.Vector3(x, y, 6), new THREE.Vector3(0, 0, -1));
    const h = rc.intersectObject(this.torso, false)[0]; if (!h) return null;
    const n = h.face.normal.clone().transformDirection(this.torso.matrixWorld);
    return { p: h.point.clone().addScaledVector(n, desde), n };
  }

  _escote() {
    // Escote en V (piel) con ribete más claro
    const filas = 10, cols = 8, pos = [], idx = [], y0 = -1.0, y1 = -1.62, ancho = .42;
    for (let j = 0; j <= filas; j++) {
      const f = j / filas, y = lerp(y0, y1, f), hx = ancho * (1 - f);
      for (let k = 0; k <= cols; k++) { const x = lerp(-hx, hx, k / cols), h = this._enTorso(x, y, .006); pos.push(...(h ? h.p.toArray() : [x, y, .3])); }
    }
    for (let j = 0; j < filas; j++) for (let k = 0; k < cols; k++) { const a = j * (cols + 1) + k, b = a + 1, c = a + cols + 1, d = c + 1; idx.push(a, c, b, b, c, d); }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(idx); g.computeVertexNormals();
    const v = new THREE.Mesh(g, this.m.pielS); v.material.side = THREE.DoubleSide; this.cuerpo.add(v);
    const pts = []; [[-ancho, y0], [0, y1], [ancho, y0]].forEach(([x, y], i, a) => { for (let t = 0; t <= 1; t += .1) { if (i === 2) break; const [x2, y2] = a[i + 1]; const h = this._enTorso(lerp(x, x2, t), lerp(y, y2, t), .02); if (h) pts.push(h.p); } });
    this.cuerpo.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 40, .035, 8), this.m.borde));
  }

  _insignias() {
    // Diente en una placa redonda (pecho derecho del personaje = lado izquierdo de la pantalla invertido) + tarjeta de nombre
    const h = this._enTorso(.5, -1.85, .03); if (!h) return;
    const placa = new THREE.Mesh(new THREE.CylinderGeometry(.24, .24, .035, 36), this.m.blanco);
    placa.rotation.x = Math.PI / 2; const g1 = new THREE.Group(); g1.add(placa); g1.position.copy(h.p); g1.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), h.n); this.cuerpo.add(g1);
    const s = new THREE.Shape(); s.moveTo(0, .30);
    s.bezierCurveTo(.12, .42, .42, .42, .42, .12); s.bezierCurveTo(.42, -.12, .26, -.2, .24, -.45); s.bezierCurveTo(.22, -.55, .11, -.55, .09, -.36);
    s.bezierCurveTo(.07, -.22, -.07, -.22, -.09, -.36); s.bezierCurveTo(-.11, -.55, -.22, -.55, -.24, -.45); s.bezierCurveTo(-.26, -.2, -.42, -.12, -.42, .12); s.bezierCurveTo(-.42, .42, -.12, .42, 0, .30);
    const diente = new THREE.Mesh(new THREE.ExtrudeGeometry(s, { depth: .03, bevelEnabled: true, bevelSize: .012, bevelThickness: .012, bevelSegments: 2 }), this._mat(COL.uniforme, .5));
    diente.scale.setScalar(.36); diente.position.set(0, .01, .035); g1.add(diente);
    const tarjeta = new THREE.Mesh(new THREE.BoxGeometry(.5, .17, .03), this.m.blanco);
    const h2 = this._enTorso(-.55, -1.95, .01); if (h2) { tarjeta.position.copy(h2.p); tarjeta.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), h2.n); this.cuerpo.add(tarjeta);
      const raya = new THREE.Mesh(new THREE.BoxGeometry(.3, .035, .035), this.m.uni); raya.position.set(0, .01, .02); tarjeta.add(raya); }
  }

  _brazos() {
    const mk = (lado) => {
      const hombro = new THREE.Group(); hombro.position.set(lado * 1.1, -1.55, 0); this.cuerpo.add(hombro);
      hombro.add(new THREE.Mesh(new THREE.SphereGeometry(.26, 28, 20), this.m.uni));
      const brazo = new THREE.Mesh(new THREE.CapsuleGeometry(.23, .5, 8, 20), this.m.uni); brazo.position.y = -.36; hombro.add(brazo);
      const codo = new THREE.Group(); codo.position.y = -.82; hombro.add(codo);
      const ante = new THREE.Mesh(new THREE.CapsuleGeometry(.16, .5, 8, 18), this.m.piel); ante.position.y = -.38; codo.add(ante);
      const mano = new THREE.Mesh(new THREE.SphereGeometry(.21, 24, 18), this.m.piel); mano.position.y = -.82; mano.scale.set(1, 1.08, .78); codo.add(mano);
      const pulgar = new THREE.Mesh(new THREE.SphereGeometry(.09, 14, 12), this.m.piel); pulgar.position.set(-lado * .17, -.74, .08); codo.add(pulgar);
      return { hombro, codo, mano };
    };
    this.brazoI = mk(1); this.brazoD = mk(-1);
    this.brazoI.hombro.rotation.z = .1; this.brazoD.hombro.rotation.z = -.1;
  }

  _cabeza() {
    const R = this.R, c = this.cara;
    const geo = new THREE.SphereGeometry(1, 96, 64), p = geo.attributes.position;
    for (let i = 0; i < p.count; i++) { const yu = p.getY(i); p.setXYZ(i, p.getX(i) * R.x * this.taper(yu), yu * R.y, p.getZ(i) * R.z); }
    geo.computeVertexNormals(); c.add(new THREE.Mesh(geo, this.m.piel));
    for (const l of [-1, 1]) {
      const oreja = new THREE.Mesh(new THREE.SphereGeometry(.17, 20, 16), this.m.pielS); oreja.scale.set(.5, 1, .8); oreja.position.set(l * .97, -.08, -.02); c.add(oreja);
      const arete = new THREE.Mesh(new THREE.SphereGeometry(.05, 14, 12), this.m.oro); arete.position.set(l * 1.0, -.3, .0); c.add(arete);
    }
    // sombra suave bajo la barbilla (sobre el cuello)
    const cv = document.createElement('canvas'); cv.width = cv.height = 64; const g = cv.getContext('2d'), r = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    r.addColorStop(0, 'rgba(150,70,45,.55)'); r.addColorStop(1, 'rgba(150,70,45,0)'); g.fillStyle = r; g.fillRect(0, 0, 64, 64);
    const sh = new THREE.Mesh(new THREE.PlaneGeometry(1.1, .5), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(cv), transparent: true, depthWrite: false }));
    sh.position.set(0, -1.0, .3); sh.rotation.x = -.5; sh.renderOrder = 2; this.cuerpo.add(sh); this.sombraCuello = sh; sh.position.y = -.93; sh.position.z = .28;
  }

  _pelo() {
    const c = this.cara, p = this.m.pelo;
    // volumen del cabello: casquete amplio hacia atrás y raya al lado
    const casco = new THREE.Mesh(new THREE.SphereGeometry(1, 80, 56, 0, Math.PI * 2, 0, 1.78), p); casco.scale.set(1.085, 1.06, 1.075); casco.rotation.x = -.98; casco.position.set(0, .03, -.04); c.add(casco);
    const corona = new THREE.Mesh(new THREE.SphereGeometry(1, 64, 40, 0, Math.PI * 2, 0, 1.15), p); corona.scale.set(1.09, 1.075, 1.085); corona.rotation.x = -.3; corona.position.set(0, .03, -.03); c.add(corona);
    // flequillo largo barrido hacia un lado (de la raya a la sien)
    this.cadena([[-.45, .93, .5], [-.2, .96, .68], [.2, .84, .8], [.62, .6, .74], [.9, .3, .5]], .27, .14, p, c, .02, .5);
    this.cadena([[-.55, .8, .45], [-.3, .84, .7], [.1, .74, .84], [.5, .5, .78]], .2, .1, p, c, .02, .45);
    this.cadena([[-.68, .8, .3], [-.78, .55, .5], [-.8, .25, .5], [-.9, -.1, .3]], .17, .09, p, c, .025, .7);     // mechón del lado de la raya
    // cabello largo por detrás de los hombros + mechón que cae por delante
    this.cadena([[.92, .3, .45], [.99, .0, .3], [1.0, -.4, .12]], .16, .1, p, c, .025, .8);
    // trenza al frente del hombro (viene de detrás de la oreja)
    const trenza = new THREE.Group(); this.cuerpo.add(trenza); this.trenza = trenza;
    const eslab = new THREE.SphereGeometry(1, 24, 18), pts = new THREE.CatmullRomCurve3([[.9, -.95, -.05], [.92, -1.35, .4], [.84, -1.85, .58], [.74, -2.4, .6], [.7, -2.85, .58]].map(q => new THREE.Vector3(...q)));
    for (let i = 0; i < 9; i++) { const u = i / 8, q = pts.getPoint(u), r = lerp(.17, .09, u);
      for (const s of [-1, 1]) { const m = new THREE.Mesh(eslab, p); m.position.copy(q).add(new THREE.Vector3(s * r * .35, 0, 0)); m.scale.set(r * .75, r * 1.0, r * .7); m.rotation.z = s * .55; trenza.add(m); } }
    const liga = new THREE.Mesh(new THREE.TorusGeometry(.1, .035, 10, 24), this.m.borde); liga.position.copy(pts.getPoint(.97)); liga.rotation.x = Math.PI / 2; trenza.add(liga);
    this.pelo = [casco];
  }

  _ojos() {
    this.ojos = []; const ER = .25;
    const bas = (color, extra = {}) => new THREE.MeshBasicMaterial({ color, ...extra });
    for (const lado of [-1, 1]) {
      const g = new THREE.Group(); this.pegar(g, lado * .4, .06, -.115, true); this.cara.add(g);
      g.add(new THREE.Mesh(new THREE.SphereGeometry(ER, 44, 32), this._mat(0xf6f8fb, .2, { emissive: 0xffffff, emissiveIntensity: .1 })));
      const iris = new THREE.Group(); g.add(iris);
      const capa = (r, col, z, sx = 1, sy = 1, y = 0) => { const m = new THREE.Mesh(new THREE.CircleGeometry(r, 40), bas(col)); m.position.set(0, y, z); m.scale.set(sx, sy, 1); iris.add(m); return m; };
      capa(.172, 0x2a160b, 0); capa(.152, 0x9a4a1b, .0015); capa(.12, 0xc9702a, .003, 1, .62, -.045); capa(.082, 0x8a3f16, .0045, 1, 1, .02); capa(.07, 0x0e0705, .006, 1, 1, .008);
      const b1 = new THREE.Mesh(new THREE.CircleGeometry(.05, 24), bas(0xffffff)); b1.position.set(-.065, .07, .008); iris.add(b1);
      const b2 = new THREE.Mesh(new THREE.CircleGeometry(.022, 20), bas(0xffffff)); b2.position.set(.065, -.065, .008); iris.add(b2);
      // párpado superior (casquete de esfera) con borde grueso de pestañas
      const pivote = new THREE.Group(); g.add(pivote);
      pivote.add(new THREE.Mesh(new THREE.SphereGeometry(ER * 1.1, 44, 26, 0, Math.PI * 2, 0, Math.PI / 2), this.m.piel));
      const linea = new THREE.Mesh(new THREE.TorusGeometry(ER * 1.1, .03, 10, 56), this._mat(0x1d0f08, .5)); linea.rotation.x = Math.PI / 2; pivote.add(linea);
      for (const [dx, dy, rz, len] of [[.22, .035, .75, .13], [.16, .12, .45, .12], [.07, .17, .12, .1]]) {   // pestañas hacia afuera
        const pe = new THREE.Mesh(new THREE.CapsuleGeometry(.014, len, 4, 8), this._mat(0x1d0f08, .5)); pe.position.set(lado * dx * 1.0, ER * .18 + dy, ER * .98 - dy * .5); pe.rotation.z = -lado * rz; g.add(pe); }
      this.ojos.push({ g, iris, pivote, lado });
    }
  }

  _cejas() {
    this.cejas = [];
    for (const lado of [-1, 1]) {
      const base = new THREE.Group(); this.pegar(base, lado * .4, .5, .035, true); this.cara.add(base);
      const mov = new THREE.Group(); base.add(mov);
      const pts = []; for (let i = 0; i <= 8; i++) { const u = i / 8 * 2 - 1; pts.push(new THREE.Vector3(u * .22, .055 * (1 - u * u) + .03 * u * lado * -.0 - .03 * Math.max(0, -u * lado), 0)); }
      mov.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 28, .036, 10), this.m.pelo));
      this.cejas.push({ base, mov, lado });
    }
  }

  // Audífonos con micrófono (asistente virtual) y lentes
  _accesorios() {
    const c = this.cara, R = this.R;
    for (const l of [-1, 1]) {
      const copa = new THREE.Group(); copa.position.set(l * (R.x + .08), -.02, -.02); c.add(copa);
      const cu = new THREE.Mesh(new THREE.CylinderGeometry(.3, .3, .18, 40), this._fis(COL.uniforme, .4, { clearcoat: .5 })); cu.rotation.z = Math.PI / 2; copa.add(cu);
      const aro = new THREE.Mesh(new THREE.TorusGeometry(.3, .035, 12, 40), this.m.gris); aro.rotation.y = Math.PI / 2; aro.position.x = l * .09; copa.add(aro);
      const alm = new THREE.Mesh(new THREE.CylinderGeometry(.22, .22, .06, 32), this.m.gris); alm.rotation.z = Math.PI / 2; alm.position.x = l * .1; copa.add(alm);
    }
    const banda = new THREE.Mesh(new THREE.TorusGeometry(R.x + .1, .05, 14, 64, Math.PI), this.m.gris); banda.position.set(0, -.02, -.02); banda.rotation.y = 0; banda.scale.set(1, 1.06, 1.08); c.add(banda);
    const pts = [[-1.12, -.2, .1], [-1.02, -.62, .5], [-.7, -.86, .9], [-.36, -.84, 1.0]].map(q => new THREE.Vector3(...q));
    c.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 40, .028, 10), this.m.gris));
    const mic = new THREE.Mesh(new THREE.SphereGeometry(.075, 20, 16), this._fis(COL.uniforme, .4)); mic.position.copy(pts[3]); mic.scale.set(1.1, .8, .8); c.add(mic);
    // lentes
    this.gafas = new THREE.Group(); c.add(this.gafas);
    for (const l of [-1, 1]) {
      const aro = new THREE.Mesh(new THREE.TorusGeometry(.325, .028, 14, 56), this.m.marco); this.pegar(aro, l * .4, .06, .17, false); this.gafas.add(aro);
      const lente = new THREE.Mesh(new THREE.CircleGeometry(.32, 40), new THREE.MeshBasicMaterial({ color: 0xcfe9ff, transparent: true, opacity: .09, depthWrite: false })); lente.position.copy(aro.position); lente.renderOrder = 5; this.gafas.add(lente);
      const brillo = new THREE.Mesh(new THREE.PlaneGeometry(.05, .2), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: .35, depthWrite: false })); brillo.position.set(l * .4 - .14, .16, aro.position.z + .003); brillo.rotation.z = .5; this.gafas.add(brillo);
      const patilla = new THREE.Mesh(new THREE.CylinderGeometry(.018, .018, .85, 8), this.m.marco); patilla.rotation.x = Math.PI / 2; patilla.position.set(l * .72, .08, this.zCara(l * .72, .08) - .38 + .1); this.gafas.add(patilla);
    }
    const puente = new THREE.Mesh(new THREE.TorusGeometry(.09, .022, 10, 20, Math.PI), this.m.marco); puente.position.set(0, .13, this.zCara(0, .1) + .17); this.gafas.add(puente);
    this.gafas.visible = (window.CONFIG_AVATAR || {}).gafas !== false;
  }

  _nariz() {
    const n = new THREE.Mesh(new THREE.SphereGeometry(.085, 24, 18), this._mat(COL.pielSombra, .55)); n.scale.set(1, .85, .9); this.pegar(n, 0, -.17, .035, false); this.cara.add(n);
    const br = new THREE.Mesh(new THREE.SphereGeometry(.02, 10, 8), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: .55 })); br.position.set(-.025, .03, .075); n.add(br);
  }

  _mejillas() {
    const cv = document.createElement('canvas'); cv.width = cv.height = 64; const g = cv.getContext('2d'), r = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    r.addColorStop(0, 'rgba(255,120,130,.85)'); r.addColorStop(1, 'rgba(255,120,130,0)'); g.fillStyle = r; g.fillRect(0, 0, 64, 64);
    const tex = new THREE.CanvasTexture(cv); this.mejillas = [];
    for (const l of [-1, 1]) { const m = new THREE.Mesh(new THREE.CircleGeometry(.2, 28), new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false, opacity: .3 })); this.pegar(m, l * .58, -.26, .012, true); m.renderOrder = 1; this.cara.add(m); this.mejillas.push(m); }
  }

  _boca() {
    this.boca = new THREE.Group(); this.cara.add(this.boca);
    const mk = (color, orden, rough = .45) => new Tira(new THREE.MeshStandardMaterial({ color, roughness: rough, side: THREE.DoubleSide }), 28, orden);
    this.tLabio = mk(COL.labio, 10); this.tInterior = mk(COL.boca, 11, .9); this.tLengua = mk(COL.lengua, 12, .6); this.tDientes = mk(0xffffff, 13, .3);
    [this.tLabio, this.tInterior, this.tLengua, this.tDientes].forEach(t => this.boca.add(t.mesh));
    this._dibujarBoca();
  }

  _dibujarBoca() {
    const e = this.estado, N = 28, y0 = -.5, ancho = .27 * e.ancho * (1 - .25 * e.redondo), o = e.abierto, s = this.cur.sonrisa, lt = .026;
    const z = (x, y, k) => this.zCara(x, y) + .008 + k * .004, sm = this.cur.sonrisa;
    const dientes = clamp(o * .5 + this.cur.dientes * .12 * clamp(s, 0, 1), 0, .12) * (o > .02 || this.cur.dientes ? 1 : 0);
    for (let i = 0; i <= N; i++) {
      const u = -1 + 2 * i / N, forma = Math.pow(Math.max(0, 1 - u * u), 1 - .5 * e.redondo), x = u * ancho;
      const base = y0 + s * .085 * u * u - s * .02 + (e.labios ? .006 : 0);
      const yU = base + o * .05 * forma + dientes * .0 + (this.cur.dientes ? .03 * forma * this.cur.dientes * clamp(s, 0, 1) : 0), yL = base - o * .27 * forma - (this.cur.dientes ? .035 * forma * this.cur.dientes * clamp(s, 0, 1) : 0);
      const gr = lt * Math.pow(forma, .4) * (1 + .35 * e.redondo);
      this.tLabio.punto(i, 0, x * 1.04, yU + gr, z(x, yU + gr, 0)); this.tLabio.punto(i, 1, x * 1.04, yL - gr * 1.15, z(x, yL - gr, 0));
      this.tInterior.punto(i, 0, x, yU, z(x, yU, 1)); this.tInterior.punto(i, 1, x, yL, z(x, yL, 1));
      const yT = Math.max(yL + .003, yU - dientes * Math.pow(forma, .45));
      this.tDientes.punto(i, 0, x, yU, z(x, yU, 3)); this.tDientes.punto(i, 1, x, yT, z(x, yT, 3));
      const yG = yL + (yU - yL) * .42 * clamp((o - .12) * 5, 0, 1) * Math.pow(forma, .6);
      this.tLengua.punto(i, 0, x, yG, z(x, yG, 2)); this.tLengua.punto(i, 1, x, yL, z(x, yL, 2));
    }
    this.tLabio.listo(); this.tInterior.listo(); this.tLengua.listo(); this.tDientes.listo();
  }

  /* ---------- Entradas ---------- */
  _eventos() {
    this._mv = e => { const r = this.renderer.domElement.getBoundingClientRect(); this.puntero.x = clamp((e.clientX - (r.left + r.width / 2)) / (innerWidth * .5), -1, 1); this.puntero.y = clamp((e.clientY - (r.top + r.height * .35)) / (innerHeight * .5), -1, 1); this.puntero.t = this.t; };
    addEventListener('pointermove', this._mv, { passive: true });
    this._ro = new ResizeObserver(() => this.resize()); this._ro.observe(this.cont);
    this._io = new IntersectionObserver(([en]) => { this.visible = en.isIntersecting; }, { threshold: 0 }); this._io.observe(this.cont); this.visible = true;
    this._vc = () => { this.pausa = document.hidden; }; document.addEventListener('visibilitychange', this._vc);
  }

  resize() {
    const w = this.cont.clientWidth, h = this.cont.clientHeight; if (!w || !h) return;
    this.renderer.setSize(w, h, false); this.cam.aspect = w / h;
    this.cam.zoom = Math.min(1, (w / h) / .8); this.cam.updateProjectionMatrix(); this.render();   // si el cuadro es más estrecho, se aleja un poco
  }

  setMood(nombre) { this.mood = MOODS[nombre] ? nombre : 'neutral'; }
  vestir(hex) { this.m.uni.color.set(hex); this._mat; }
  saludar() { this.saludoT = this.t; }

  // palabras: ['hola','soy'...] · tiempos/duraciones en ms desde ahora
  hablar({ palabras, tiempos, duraciones }) {
    const pista = [];
    palabras.forEach((w, i) => {
      const limpia = this.lip.preProcessText(w.replace(/[¿¡?!.,;:()"]/g, '')) || '';
      const r = this.lip.wordsToVisemes(limpia); if (!r.visemes.length) return;
      const total = r.times[r.times.length - 1] + r.durations[r.durations.length - 1], k = duraciones[i] / total;
      r.visemes.forEach((v, j) => pista.push({ v, t0: tiempos[i] + r.times[j] * k, t1: tiempos[i] + (r.times[j] + r.durations[j]) * k, palabra: i }));
    });
    this.pista = { lista: pista, inicio: performance.now(), tiempos, fin: Math.max(...pista.map(p => p.t1), 0) + 250 };
    if (this.saludoT < 0 || this.t - this.saludoT > 5) this.saludar();
  }
  // Si la voz del navegador avisa en qué palabra va, se sincroniza
  palabra(i) { if (this.pista && this.pista.tiempos[i] != null) this.pista.inicio = performance.now() - this.pista.tiempos[i]; }
  detener() { this.pista = null; }
  get hablando() { return !!this.pista; }

  /* ---------- Bucle ---------- */
  start() { if (this.activo) return; this.activo = true; this.ultimo = performance.now(); const f = n => { if (!this.activo) return; this._raf = requestAnimationFrame(f); if (this.visible && !this.pausa) this.frame(n); }; this._raf = requestAnimationFrame(f); }
  stop() { this.activo = false; cancelAnimationFrame(this._raf); }
  dispose() { this.stop(); removeEventListener('pointermove', this._mv); this._ro.disconnect(); this._io.disconnect(); document.removeEventListener('visibilitychange', this._vc); this.renderer.dispose(); this.renderer.domElement.remove(); }
  render() { this.renderer.render(this.scene, this.cam); }

  frame(now) {
    const dt = Math.min(.05, (now - this.ultimo) / 1000); this.ultimo = now; this.t += dt; const t = this.t, e = this.estado, M = MOODS[this.mood], c = this.cur;
    for (const k in M) c[k] = suave(c[k], M[k], 6, dt);

    // --- Boca: visema actual ---
    let v = null; const P = this.pista;
    if (P) { const ms = now - P.inicio; if (ms > P.fin) this.pista = null; else for (const p of P.lista) { if (ms >= p.t0 && ms < p.t1) { v = p; break; } if (p.t0 > ms) break; } }
    const V = { aa: [.9, 1.05, 0, 0], E: [.5, 1.25, 0, 0], I: [.3, 1.35, 0, 0], O: [.65, .72, 1, 0], U: [.38, .55, 1, 0], PP: [0, .95, 0, 1], FF: [.1, 1.0, 0, 0], DD: [.3, 1.05, 0, 0], nn: [.28, 1.0, 0, 0], kk: [.34, 1.0, 0, 0], SS: [.14, 1.3, 0, 0], RR: [.3, .9, .3, 0], CH: [.22, .8, .5, 0] };
    const a = v ? (V[v.v] || [.25, 1, 0, 0]) : [0, 1, 0, 0];
    this.obj.abierto = a[0] * (v ? .92 + .08 * Math.sin(t * 17) : 1); this.obj.ancho = a[1]; this.obj.redondo = a[2]; this.obj.labios = a[3];
    const kb = v ? 26 : 12;
    e.abierto = suave(e.abierto, this.obj.abierto, kb, dt); e.ancho = suave(e.ancho, this.obj.ancho, kb, dt); e.redondo = suave(e.redondo, this.obj.redondo, kb, dt); e.labios = this.obj.labios;
    e.habla = suave(e.habla, P ? 1 : 0, 5, dt);
    this._dibujarBoca();

    // --- Mirada: puntero si se movió hace poco; si no, miradas al azar ---
    if (t - this.azar.t > 2.4) { this.azar = { x: (Math.random() - .5) * 1.1, y: (Math.random() - .5) * .6, t }; }
    const usaP = t - this.puntero.t < 4;
    const mx = M.mirarX || (usaP ? this.puntero.x : this.azar.x), my = M.mirarY || (usaP ? -this.puntero.y : this.azar.y);
    e.mx = suave(e.mx, mx, 9, dt); e.my = suave(e.my, my, 9, dt);

    // --- Parpadeo ---
    if (this.parpT < 0 && t > this.proxParp) { this.parpT = 0; this.proxParp = t + 2.2 + Math.random() * 3.2; }
    if (this.parpT >= 0) { this.parpT += dt; const d = .2, p = this.parpT / d; e.parpadeo = p < .4 ? p / .4 : Math.max(0, 1 - (p - .4) / .6); if (p >= 1) { this.parpT = -1; e.parpadeo = 0; if (Math.random() < .15) this.proxParp = t + .25; } }

    for (const o of this.ojos) {
      const beta = lerp(c.parp, .05, e.parpadeo) * (1 - .0);
      o.pivote.rotation.x = Math.PI / 2 - beta;
      o.iris.position.set(clamp(e.mx, -1, 1) * .07, clamp(e.my, -1, 1) * .05 + .0, 0);
      const r = Math.sqrt(.25 ** 2 - o.iris.position.x ** 2 - o.iris.position.y ** 2); o.iris.position.z = r + .003;
      o.iris.rotation.set(-o.iris.position.y / .25, o.iris.position.x / .25, 0);
      o.g.scale.y = 1 + .04 * e.habla * Math.sin(t * 5);
    }
    // --- Cejas ---
    const sube = c.ceja * .06 + e.habla * (.012 + .012 * Math.sin(t * 3.1)) + e.abierto * .01;
    for (const b of this.cejas) {
      const asim = this.mood === 'pensando' && b.lado === 1 ? 1 : this.mood === 'pensando' ? .25 : 1;
      b.mov.position.y = sube * asim; b.mov.rotation.z = b.lado * -(c.inclina * .38) * asim + (b.lado === -1 ? 1 : -1) * 0;
    }
    this.mejillas.forEach(m => (m.material.opacity = .2 + c.mejilla * .45));

    // --- Cabeza y cuerpo: respiración, balanceo, seguir el puntero ---
    const yaw = clamp(e.mx, -1, 1) * .26 + Math.sin(t * .6) * .035, pit = -clamp(e.my, -1, 1) * .14 + Math.sin(t * .8) * .02;
    const asiente = e.habla * (Math.sin(t * 4.3) * .035 + Math.sin(t * 2.1) * .02);
    this.cabeza.rotation.set(pit + asiente, yaw, c.cabezaZ + Math.sin(t * .5) * .02 + e.habla * Math.sin(t * 2.6) * .025, 'YXZ');
    this.cuerpo.scale.set(1 + Math.sin(t * 1.5) * .006, 1 + Math.sin(t * 1.5) * .012, 1); this.cuerpo.position.y = Math.sin(t * 1.5) * .012;
    this.raiz.rotation.y = yaw * .25; this.raiz.position.y = Math.sin(t * 1.5 + 1) * .01;

    // --- Saludo con la mano (brazo derecho del personaje) ---
    const sT = this.saludoT >= 0 ? this.t - this.saludoT : -1, dur = 2.6;
    let w = 0; if (sT >= 0 && sT < dur) w = Math.sin(clamp(sT / dur, 0, 1) * Math.PI) ** .6; else if (sT >= dur) this.saludoT = -1;
    e.saludo = suave(e.saludo, w, 14, dt); const sw = e.saludo, B = this.brazoD, bal = Math.sin(t * 9) * .32;
    B.hombro.rotation.set(-1.0 * sw, 0, lerp(-.1, .14, sw)); B.codo.rotation.set(-2.15 * sw, 0, bal * sw * 1.0 + 0); B.mano.rotation.z = bal * .5 * sw;
    const I = this.brazoI; I.hombro.rotation.z = .1 + Math.sin(t * 1.5) * .01;

    this.render();
  }
}
