// Prueba el asistente con las preguntas de pruebas/preguntas.json (sin red neuronal y simulando "fuera de tema").
// Uso:  node pruebas/probar_asistente.js
const fs = require('fs'), vm = require('vm'), path = require('path');
const c = { window: {}, console }; vm.createContext(c);
const leer = f => fs.readFileSync(path.join(__dirname, '..', 'js', f), 'utf8');
vm.runInContext(leer('contenido.js') + ';' + leer('asistente.js') + ';this.A=Asistente', c);
const T = JSON.parse(fs.readFileSync(path.join(__dirname, 'preguntas.json'), 'utf8')); let mal = 0;
for (const [q, esperado] of T) for (const p of [null, { fueraDeTema: true, confianza: .9, dominio: null }]) {
  const r = c.A.responder(q, p);
  const got = r.area + (r.item && r.item.id ? ':' + r.item.id : '') + (r.todosServicios ? ':todosS' : '');
  if (!esperado.split('|').some(e => got.startsWith(e))) { mal++; console.log('X', JSON.stringify(q), '->', got, '(esperado', esperado + ')'); }
}
console.log('Fallos:', mal, 'de', T.length * 2, 'pruebas (' + T.length + ' preguntas)');
