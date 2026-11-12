// Avatar semi-realista (SVG por capas) con parpadeo, mirada, respiración, expresiones y sincronía labial.
// (Avatar ilustrado de respaldo; el avatar 3D está en avatar3d.js) Interfaz: AvatarSVG.mount(el) · Avatar.speak(texto) · Avatar.expr('neutral'|'feliz'|'pensando') · Avatar.stop()
// Para fotorrealismo de video real, sustituya este archivo por TalkingHead / D-ID manteniendo esa interfaz.
const HAIR_STRANDS=["M70 80C76 60 92 48 108 46","M64 96C62 70 76 52 96 44","M100 40C118 44 134 58 138 84","M110 48C124 56 132 70 134 90","M84 62C92 52 104 48 116 50","M126 62C134 72 138 84 138 96"];
const AvatarSVG={muted:false,timer:null,
 st:{o:0,to:0,rd:0,tr:0,s:.3,ts:.3,bl:0,tbl:0,gx:0,gy:0,tgx:0,tgy:0,lb:0,tlb:0,rb:0,trb:0,sq:0,tsq:0,speaking:false},
 mount(el){this.el=el;const im=new Image();im.onload=()=>this.mountPhoto(el,im);im.onerror=()=>this.mountSvg(el);im.src='assets/img/avatar.jpg?'+Date.now()},
 mountSvg(el){this.el=el;el.innerHTML=`<svg viewBox="15 12 170 200" xmlns="http://www.w3.org/2000/svg"><defs>
<linearGradient id="bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#eef1f3"/><stop offset="1" stop-color="#c9d1d6"/></linearGradient>
<radialGradient id="skin" cx=".5" cy=".42" r=".7"><stop offset="0" stop-color="#f7d9c3"/><stop offset=".65" stop-color="#edc2a4"/><stop offset="1" stop-color="#d9a284"/></radialGradient>
<linearGradient id="side" x1="0" x2="1"><stop offset="0" stop-color="#7a4b35" stop-opacity=".3"/><stop offset=".25" stop-opacity="0"/><stop offset=".75" stop-opacity="0"/><stop offset="1" stop-color="#7a4b35" stop-opacity=".3"/></linearGradient>
<radialGradient id="blush"><stop offset="0" stop-color="#e2807c" stop-opacity=".45"/><stop offset="1" stop-color="#e2807c" stop-opacity="0"/></radialGradient>
<radialGradient id="hl"><stop offset="0" stop-color="#fff" stop-opacity=".35"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>
<linearGradient id="hair" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5d3b27"/><stop offset="1" stop-color="#25160e"/></linearGradient>
<linearGradient id="coat" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="#d5dde1"/></linearGradient>
<linearGradient id="neck" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#c08b70"/><stop offset=".5" stop-color="#dfae92"/><stop offset="1" stop-color="#d09a7d"/></linearGradient>
<radialGradient id="scl"><stop offset=".5" stop-color="#fff"/><stop offset="1" stop-color="#dcd5cf"/></radialGradient>
<radialGradient id="irisG"><stop offset="0" stop-color="#b0773f"/><stop offset=".55" stop-color="#7a4a26"/><stop offset=".9" stop-color="#3a2212"/><stop offset="1" stop-color="#1c0f08"/></radialGradient>
<linearGradient id="upl" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#b85a5f"/><stop offset="1" stop-color="#9a444b"/></linearGradient>
<linearGradient id="lol" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#cf7377"/><stop offset="1" stop-color="#ad565d"/></linearGradient>
<linearGradient id="tt" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="#e6e0da"/></linearGradient>
<clipPath id="ec"><path d="M75 106.5Q86 98 97 106.5Q86 113 75 106.5Z"/></clipPath><clipPath id="mc"><path id="mcp"/></clipPath>
<g id="eye"><path d="M75 106.5Q86 98 97 106.5Q86 113 75 106.5Z" fill="url(#scl)"/>
<g clip-path="url(#ec)"><g id="iris"><circle cx="86" cy="106.2" r="5.2" fill="url(#irisG)"/><circle cx="86" cy="106.2" r="2.3" fill="#0b0705"/><circle cx="84.2" cy="104.4" r="1.4" fill="#fff" opacity=".9"/><circle cx="88.2" cy="108" r=".7" fill="#fff" opacity=".5"/></g>
<rect id="lid" x="70" y="94" width="32" height="0" fill="#e8bd9e"/><path d="M74 100Q86 95 98 100V104Q86 99 74 104Z" fill="#7a4b35" opacity=".18"/></g>
<path d="M74.5 107Q86 97.5 97.5 107" stroke="#160c07" stroke-width="1.9" fill="none" stroke-linecap="round"/><path d="M97 106.5l2.2-1.6" stroke="#160c07" stroke-width="1.1" stroke-linecap="round"/>
<path d="M76 100Q86 94 96 100" stroke="#a97558" stroke-width=".9" fill="none" opacity=".6"/><path d="M77 109Q86 113.8 95 109" stroke="#b07a60" stroke-width=".7" fill="none" opacity=".6"/></g>
<path id="brow" d="M72 96.5Q80 88.5 99 92Q85 90.5 73.5 100Z" fill="#33200f"/></defs>
<rect x="0" y="0" width="200" height="240" fill="url(#bg)"/>
<g id="hb"><path d="M52 100C44 50 70 24 100 24C130 24 156 50 148 100C146 130 152 160 162 196L40 196C50 160 54 130 52 100Z" fill="url(#hair)"/></g>
<g id="body"><path d="M14 240C14 196 48 184 82 176L118 176C152 184 186 196 186 240Z" fill="url(#coat)" stroke="#c2cbd0"/><path d="M82 176L100 212L118 176C110 183 90 183 82 176Z" fill="#9fb0b8"/>
<path d="M82 176L96 216L68 202L62 182Z" fill="#fff" stroke="#c2cbd0"/><path d="M118 176L104 216L132 202L138 182Z" fill="#fff" stroke="#c2cbd0"/>
<path d="M72 184C62 212 74 232 100 234C126 232 138 212 128 184" stroke="#2b2b2b" stroke-width="2.4" fill="none"/><circle cx="100" cy="235" r="5.5" fill="#6d747a" stroke="#2b2b2b"/>
<rect x="132" y="206" width="24" height="11" rx="2" fill="#fff" stroke="#bbb"/><path d="M135 210h12M135 213.5h8" stroke="#888" stroke-width="1.2"/></g>
<path d="M85 138V180C92 187 108 187 115 180V138Z" fill="url(#neck)"/><ellipse cx="100" cy="152" rx="24" ry="9" fill="#5a3322" opacity=".18"/>
<g id="head"><ellipse cx="62" cy="109" rx="6" ry="11" fill="#e3b296"/><ellipse cx="138" cy="109" rx="6" ry="11" fill="#e3b296"/><path d="M62 104q-3 5 0 10M138 104q3 5 0 10" stroke="#b9826a" fill="none"/><circle cx="62" cy="122" r="1.9" fill="#d4af37"/><circle cx="138" cy="122" r="1.9" fill="#d4af37"/>
<path id="face" d="M62 90C62 54 80 38 100 38S138 54 138 90C138 116 133 136 122 152C113 164 107 173 100 173C93 173 87 164 78 152C67 136 62 116 62 90Z" fill="url(#skin)"/>
<path d="M62 90C62 54 80 38 100 38S138 54 138 90C138 116 133 136 122 152C113 164 107 173 100 173C93 173 87 164 78 152C67 136 62 116 62 90Z" fill="url(#side)"/>
<ellipse cx="100" cy="68" rx="24" ry="10" fill="url(#hl)"/><ellipse cx="76" cy="128" rx="13" ry="8" fill="url(#blush)" id="bl1"/><ellipse cx="124" cy="128" rx="13" ry="8" fill="url(#blush)" id="bl2"/>
<ellipse cx="86" cy="114" rx="9" ry="2.4" fill="#b97f65" opacity=".13"/><ellipse cx="114" cy="114" rx="9" ry="2.4" fill="#b97f65" opacity=".13"/><ellipse cx="100" cy="166" rx="8" ry="3" fill="url(#hl)"/>
<path d="M96.5 100C95.5 112 93.5 120 91 128M103.5 100C104.5 112 106.5 120 109 128" stroke="#b4806a" stroke-width="1.2" fill="none" opacity=".3"/>
<path d="M90 128C88 131 90 134.500 93 134M110 128C112 131 110 134.5 107 134M92.500 135C95 138 98 138 100 138S105 138 107.500 135" stroke="#a8694f" stroke-width="1.4" fill="none" opacity=".75"/>
<ellipse cx="95.600" cy="133.500" rx="2.500" ry="1.400" fill="#7d4a3a" opacity=".75"/><ellipse cx="104.400" cy="133.500" rx="2.500" ry="1.400" fill="#7d4a3a" opacity=".75"/><ellipse cx="100" cy="128.500" rx="3.200" ry="2.600" fill="#fff" opacity=".25"/>
<path d="M97 141L97.500 147M103 141L102.500 147" stroke="#bf8a71" stroke-width="1" opacity=".5"/><ellipse cx="100" cy="140" rx="7" ry="1.600" fill="#a8715c" opacity=".22"/>
<use href="#eye" transform="translate(-6 0)"/><use href="#eye" transform="translate(206 0) scale(-1 1)"/>
<use href="#brow" id="bL"/><use href="#brow" id="bR"/>
<ellipse cx="100" cy="162" rx="12" ry="2.800" fill="#9c5c48" opacity=".16" id="msh"/>
<path id="cav" fill="#4a0f18" stroke="#6d2a31" stroke-width=".7"/><g clip-path="url(#mc)"><rect id="tu" fill="url(#tt)"/><rect id="tl" fill="url(#tt)"/><ellipse id="tg" fill="#c4606a"/></g>
<path id="up" fill="url(#upl)"/><path id="lo" fill="url(#lol)"/><ellipse id="lh" fill="#fff" opacity=".25"/>
<path d="M60 96C54 56 78 34 104 36C128 38 146 58 140 98C138 80 130 66 116 58C102 66 82 66 68 80C62 86 61 92 60 96Z" fill="url(#hair)"/>
<g stroke="#8a6040" stroke-width=".8" fill="none" opacity=".55">${HAIR_STRANDS.map(d=>`<path d="${d}"/>`).join('')}</g></g></svg>`;
  const $=s=>el.querySelector(s);this.n={mcp:$('#mcp'),cav:$('#cav'),up:$('#up'),lo:$('#lo'),lh:$('#lh'),tu:$('#tu'),tl:$('#tl'),tg:$('#tg'),lid:el.querySelector('#lid'),iris:el.querySelector('#iris'),bL:$('#bL'),bR:$('#bR'),hb:$('#hb'),head:$('#head'),body:$('#body'),bl1:$('#bl1'),bl2:$('#bl2'),msh:$('#msh')};
  const st=this.st;setInterval(()=>{st.tbl=1;setTimeout(()=>st.tbl=0,110)},2800+Math.random()*2200);
  setInterval(()=>{const k=st.speaking?.5:1.4;st.tgx=(Math.random()-.5)*2*k;st.tgy=(Math.random()-.5)*k},1800);
  const loop=t=>{if(!document.body.contains(el))return;this.render(t);requestAnimationFrame(loop)};requestAnimationFrame(loop)},
 // ---- Modo FOTO: anima una foto real (frontal, boca cerrada). Calibrar con index.html?calibrar=1
 async mountPhoto(el,im){const W=340,H=400,c=document.createElement('canvas');c.width=W;c.height=H;c.style.cssText='width:100%;display:block';el.innerHTML='';el.appendChild(c);
  const g=c.getContext('2d'),st=this.st;let cfg={lx:.38,ly:.42,rx:.62,ry:.42,mx:.5,my:.66,mw:.17};
  try{Object.assign(cfg,await (await fetch('data/avatar-config.json')).json())}catch(e){}try{Object.assign(cfg,JSON.parse(localStorage.avatarCfg||'{}'))}catch(e){}
  const b=document.createElement('canvas');b.width=W;b.height=H;const bg=b.getContext('2d'),k=Math.max(W/im.width,H/im.height);bg.drawImage(im,(W-im.width*k)/2,(H-im.height*k)/2,im.width*k,im.height*k);
  if(/calibrar/.test(location.search)){const q=['OJO IZQUIERDO (centro)','OJO DERECHO (centro)','COMISURA IZQUIERDA de la boca','COMISURA DERECHA de la boca'],pts=[],t=document.createElement('div');t.style.cssText='font:700 13px system-ui;padding:6px';t.textContent='Clic en: '+q[0];el.appendChild(t);el.style.width='min(90vw,400px)';el.style.aspectRatio='auto';
   c.onclick=e=>{const r=c.getBoundingClientRect();pts.push([(e.clientX-r.left)/r.width,(e.clientY-r.top)/r.height]);if(pts.length<4){t.textContent='Clic en: '+q[pts.length];return}
    const[a,d,m1,m2]=pts,o={lx:a[0],ly:a[1],rx:d[0],ry:d[1],mx:(m1[0]+m2[0])/2,my:(m1[1]+m2[1])/2,mw:Math.abs(m2[0]-m1[0])};localStorage.avatarCfg=JSON.stringify(o);prompt('Listo. Guarda este JSON en data/avatar-config.json:',JSON.stringify(o))}}
  const mw=cfg.mw*W,mx=cfg.mx*W,my=cfg.my*H,pw=Math.round(mw*2.3),ph=Math.round(mw*1.4),x0=mx-pw/2;
  const p=document.createElement('canvas');p.width=pw;p.height=ph;const pg=p.getContext('2d');pg.drawImage(b,x0,my,pw,ph,0,0,pw,ph);
  const gr=pg.createRadialGradient(pw/2,ph*.12,pw*.1,pw/2,ph*.12,pw*.44);gr.addColorStop(0,'#000');gr.addColorStop(1,'rgba(0,0,0,0)');pg.globalCompositeOperation='destination-in';pg.fillStyle=gr;pg.fillRect(0,0,pw,ph);
  const ew=Math.abs(cfg.rx-cfg.lx)*W*.27,eyes=[[cfg.lx*W,cfg.ly*H],[cfg.rx*W,cfg.ry*H]];
  const skin=(x,y)=>{try{const d=bg.getImageData(x-1,y-1,3,3).data;let r=0,gg=0,bb=0;for(let i=0;i<36;i+=4){r+=d[i];gg+=d[i+1];bb+=d[i+2]}return`rgb(${r/9|0},${gg/9|0},${bb/9|0})`}catch(e){return'#d8a98c'}};
  const lidC=eyes.map(([x,y])=>skin(x,y-ew*.9));
  setInterval(()=>{st.tbl=1;setTimeout(()=>st.tbl=0,120)},2800+Math.random()*2200);
  const e=(a,z,f)=>a+(z-a)*f,loop=t=>{if(!document.body.contains(el))return;requestAnimationFrame(loop);
   st.o=e(st.o,st.to,.5);st.rd=e(st.rd,st.tr,.4);st.bl=e(st.bl,st.tbl,.6);
   g.setTransform(1,0,0,1,0,0);g.clearRect(0,0,W,H);const rot=(Math.sin(t/1900)+(st.speaking?Math.sin(t/230)*1.2:0))*.012,sc=1.035+Math.sin(t/1500)*.003;
   g.translate(W/2+Math.sin(t/2700)*1.5,H*.7+Math.sin(t/2300)*1.2);g.rotate(rot);g.scale(sc,sc);g.translate(-W/2,-H*.7);g.drawImage(b,0,0);
   const gap=st.o*.24*mw;
   if(gap>.6){const rx=mw*.44*(1-.25*st.rd);g.save();g.beginPath();g.ellipse(mx,my+gap*.5,rx,gap*.62+1,0,0,7);g.clip();
    const cg=g.createLinearGradient(0,my,0,my+gap);cg.addColorStop(0,'#3a0d14');cg.addColorStop(1,'#16060a');g.fillStyle=cg;g.fillRect(mx-rx,my-2,rx*2,gap+6);
    g.fillStyle='rgba(244,240,232,.95)';g.fillRect(mx-rx*.8,my-1,rx*1.6,Math.max(2,gap*.5));g.fillStyle='rgba(176,84,92,.9)';g.beginPath();g.ellipse(mx,my+gap*.95,rx*.5,gap*.35,0,0,7);g.fill();g.restore()}
   g.drawImage(p,x0,my+gap);
   if(st.bl>.05)eyes.forEach(([x,y],i)=>{g.save();g.filter='blur(.8px)';g.fillStyle=lidC[i];g.beginPath();g.ellipse(x,y-ew*.15+ew*.1*st.bl,ew*.62,ew*.5*st.bl+.1,0,0,7);g.fill();g.restore();g.strokeStyle='rgba(25,14,10,.6)';g.lineWidth=1.3;g.beginPath();g.moveTo(x-ew*.6,y+ew*.05);g.quadraticCurveTo(x,y+ew*(.05+.25*st.bl),x+ew*.6,y+ew*.05);g.stroke()})};
  requestAnimationFrame(loop)},
 render(t){const st=this.st,n=this.n,e=(a,b,k)=>a+(b-a)*k;
  st.o=e(st.o,st.to,.5);st.rd=e(st.rd,st.tr,.4);st.s=e(st.s,st.ts,.1);st.bl=e(st.bl,st.tbl,.6);st.gx=e(st.gx,st.tgx,.15);st.gy=e(st.gy,st.tgy,.15);st.lb=e(st.lb,st.tlb,.12);st.rb=e(st.rb,st.trb,.12);st.sq=e(st.sq,st.tsq,.1);
  const o=st.o,s=st.s,rd=st.rd,od=o*11,cy=152,hw=16.5-3.5*rd+1.2*s,L=100-hw,R=100+hw,yc=cy-s*1.4,m=hw*.5,u=hw*.65,f=hw*.2;
  const cav=`M${L} ${yc}C${100-m} ${cy-1.8} ${100+m} ${cy-1.8} ${R} ${yc}C${100+m} ${cy-1.4+od} ${100-m} ${cy-1.4+od} ${L} ${yc}Z`;
  n.cav.setAttribute('d',cav);n.mcp.setAttribute('d',cav);
  n.up.setAttribute('d',`M${L} ${yc}C${100-u} ${cy-7.5} ${100-f} ${cy-9} 100 ${cy-6.2}C${100+f} ${cy-9} ${100+u} ${cy-7.5} ${R} ${yc}C${100+m} ${cy-1.8} ${100-m} ${cy-1.8} ${L} ${yc}Z`);
  n.lo.setAttribute('d',`M${L} ${yc}C${100-m} ${cy-1.4+od} ${100+m} ${cy-1.4+od} ${R} ${yc}C${100+u} ${cy+8+od} ${100-u} ${cy+8+od} ${L} ${yc}Z`);
  const set=(el,o)=>{for(const k in o)el.setAttribute(k,o[k])};
  set(n.lh,{cx:100,cy:cy+3.6+od*.75,rx:hw*.35,ry:1.2});
  set(n.tu,{x:100-hw*.85,y:cy-3,width:hw*1.7,height:5.5});set(n.tl,{x:100-hw*.7,y:cy-1.4+od*.75-3,width:hw*1.4,height:o>.35?4:0});
  set(n.tg,{cx:100,cy:cy-1.4+od*.7-1.5,rx:hw*.5,ry:Math.min(4.5,od*.5)});set(n.msh,{cy:cy+11+od*.6,rx:12+o*2});
  const lidH=Math.min(16,st.bl*16+st.sq*3.5);n.lid.setAttribute('height',lidH);n.iris.setAttribute('transform',`translate(${st.gx} ${st.gy})`);
  n.bL.setAttribute('transform',`translate(-6 ${st.lb})`);n.bR.setAttribute('transform',`translate(206 ${st.rb}) scale(-1 1)`);
  n.bl1.setAttribute('opacity',.7+Math.max(0,s)*.25);n.bl2.setAttribute('opacity',.7+Math.max(0,s)*.25);
  const rot=Math.sin(t/1900)*1+(st.speaking?Math.sin(t/230)*1.3:0),tx=Math.sin(t/2700)*.8,ty=Math.sin(t/2300)*.7+(st.speaking?Math.sin(t/310)*.5:0);
  const tf=`translate(${tx} ${ty}) rotate(${rot} 100 178)`;n.head.setAttribute('transform',tf);n.hb.setAttribute('transform',tf);n.body.setAttribute('transform',`translate(0 ${Math.sin(t/1500)*.8})`)},
 expr(name){const s=this.st,P={neutral:[.3,0,0,0],feliz:[1.7,-1.5,-1.5,1],pensando:[-.1,-.5,-3.5,0]}[name]||[.3,0,0,0];[s.ts,s.tlb,s.trb,s.tsq]=P},
 speak(t){clearInterval(this.timer);const txt=t.replace(/<[^>]+>/g,''),st=this.st;st.speaking=true;this.expr('feliz');let i=0;
  const map={a:1,o:.8,e:.65,u:.55,i:.4,m:0,b:0,p:0};
  this.timer=setInterval(()=>{const c=(txt[i++]||'').toLowerCase();if(i>txt.length){this.stop();return}
   st.to=(map[c]??(/[a-z]/.test(c)?.25:0))*(.85+Math.random()*.25);st.tr=(c==='o'||c==='u')?1:0;
   if(i%28==0)this.expr(Math.random()>.45?'feliz':'neutral')},75);
  if(this.muted||!('speechSynthesis' in window))return;speechSynthesis.cancel();
  const u=new SpeechSynthesisUtterance(txt);u.lang='es-MX';u.rate=1;const v=speechSynthesis.getVoices().find(x=>x.lang.startsWith('es'));if(v)u.voice=v;
  u.onend=()=>this.stop();speechSynthesis.speak(u)},
 stop(){clearInterval(this.timer);const s=this.st;s.to=0;s.tr=0;s.speaking=false;this.expr('neutral')}};
