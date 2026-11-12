#!/usr/bin/env python3
"""Extractor estatico conservador para web estatica/React de la Dra. Janet. No ejecuta codigo del proyecto."""
import argparse
import csv
import html
import json
import re
from pathlib import Path

SKIP_DIRS = {'node_modules', 'dist', 'build', '.git', '.next', 'coverage', 'salida_dataset', 'Bot', 'entrenamiento', 'modelo', 'vendor', 'modules', 'avatars', 'img', 'img_originales_baja_resolucion', 'assets', 'resultados', 'modelo_web', 'modelo_exportado'}
EXTS = {'.jsx', '.tsx', '.js', '.ts', '.json', '.html', '.md'}
FIELDS = {'title','titulo','navTitle','description','descripcion','resumen','pregunta','respuesta',
          'tratamiento','subtitulo','filosofia','texto','etapa','categoria','category',
          'area','ubicacion','telefono','correo','horarios','compromisos','areasAtencion',
          'beneficios','label','nombre','alt','etiqueta','corta','procedimientos','claves','relacionados','direccion','direccionTexto','whatsapp','redes','especialidad','formacion','cedula','horario','aviso','tituloCorto','descripcionCorta'}
DOMAIN_RULES = [
 ('contacto', ['contacto','ubicacion','teléfono','telefono','whatsapp','correo','horarios','cita','agenda','valoración']),
 ('tratamientos', ['tratamiento','ortodoncia','implante','encía','encia','blanqueamiento','endodoncia','carilla','prótesis','protesis','odontopediatría','rehabilitación','rehabilitacion','sonrisa','periodoncia']),
 ('equipo_clinico', ['doctora','dra.','credencial','equipo','odontóloga','odontologo','nosotros','trayectoria']),
 ('instalaciones_tecnologia', ['instalaciones','tecnología','tecnologia','escáner','escaner','3d','consultorio']),
 ('casos_clinicos', ['caso clínico','casos clínicos','antes','después','pacientes reales','fases de cada caso']),
 ('privacidad_legal', ['privacidad','aviso legal','términos','terminos','cookies','datos personales']),
]
INTENT_RULES = [
 ('solicitar_cita', ['agendar','agenda tu cita','solicitar valoración','programar tu valoración','agendar cita']),
 ('consultar_contacto', ['contacto','teléfono','telefono','whatsapp','correo','ubicación','ubicacion','horarios']),
 ('consultar_tratamiento', ['tratamiento','ortodoncia','implante','endodoncia','blanqueamiento','carilla','prótesis','protesis']),
 ('consultar_equipo', ['doctora','dra.','equipo','credencial']),
 ('consultar_instalaciones', ['instalaciones','tecnología','tecnologia','3d']),
 ('consultar_casos', ['casos clínicos','caso clínico','antes y después','resultados reales']),
 ('consultar_privacidad', ['privacidad','aviso','términos','cookies']),
]
PLACEHOLDERS = ['000 0000', '0000000', 'ejemplo.com', 'unsplash.com', '100%', '99%', 'pacientes reales', 'resultados reales']

def clean(s):
    s = html.unescape(s)
    s = re.sub(r'\{[^{}]{0,300}\}', ' ', s)
    s = re.sub(r'<[^>]*>', ' ', s)
    return re.sub(r'\s+', ' ', s).strip()

def classify(text, rules, default):
    t = text.casefold()
    for name, words in rules:
        if any(w in t for w in words):
            return name
    return default

def add(rows, seen, source, line, field, text, extraction):
    text = clean(text)
    if len(text) < 8 or len(text) > 1800 or not re.search(r'[A-Za-zÁÉÍÓÚáéíóúñÑ]', text):
        return
    if re.match(r'^(?:https?://|/|#|@|[\w.-]+\.(?:png|jpg|mp4|svg))', text, re.I):
        return
    key = (source, text.casefold())
    if key in seen:
        return
    seen.add(key)
    note = 'revisar: posible dato de prueba' if any(p in text.casefold() for p in PLACEHOLDERS) else 'pendiente de validacion'
    rows.append({'id': f'F{len(rows)+1:05d}', 'archivo': source, 'linea': line, 'campo': field,
                 'texto': text, 'dominio_sugerido': classify(text+' '+source, DOMAIN_RULES, 'general'),
                 'intencion_sugerida': classify(text, INTENT_RULES, 'sin_clasificar'),
                 'estado': note, 'metodo': extraction})

def main():
    p = argparse.ArgumentParser()
    p.add_argument('--root', type=Path, default=Path.cwd())
    args = p.parse_args()
    root = args.root.resolve()
    if not (root / 'package.json').exists() and not (root / 'src').exists():
        raise SystemExit('No se encontro src/ ni package.json en la raiz indicada.')
    out = root / 'salida_dataset'
    out.mkdir(exist_ok=True)
    rows, seen, scanned = [], set(), []
    for file in sorted(root.rglob('*')):
        if not file.is_file() or file.suffix.lower() not in EXTS:
            continue
        rel = file.relative_to(root)
        if any(part in SKIP_DIRS or part.startswith('.') for part in rel.parts[:-1]):
            continue
        if file.name in {'extraer_dataset.py','generar_preguntas.py','package-lock.json','pnpm-lock.yaml','yarn.lock','tsconfig.json','jsconfig.json','components.json'}:
            continue
        if file.stat().st_size > 200_000:
            continue
        try:
            content = file.read_text(encoding='utf-8-sig')
        except (UnicodeError, OSError):
            continue
        source = rel.as_posix()
        if source.startswith('js/') and source not in {'js/contenido.js'}:
            continue
        if source.startswith('src/') and file.name not in {'ui.jsx','vistas.jsx','inicio.jsx','main.jsx'}:
            continue
        scanned.append(source)
        if file.suffix == '.json':
            try:
                data = json.loads(content)
                def walk(v, key='dato'):
                    if isinstance(v, dict):
                        for k, val in v.items():
                            walk(val, k)
                    elif isinstance(v, list):
                        for val in v: walk(val, key)
                    elif isinstance(v, str) and key in FIELDS:
                        add(rows, seen, source, 0, key, v, 'json')
                walk(data)
            except json.JSONDecodeError:
                pass
        # Strings asociadas a campos semanticos: no se ejecuta JavaScript.
        field_pattern = re.compile(r'\b('+'|'.join(map(re.escape, sorted(FIELDS, key=len, reverse=True)))+r')\s*:\s*([\'\"`])((?:\\.|(?!\2).)*?)\2', re.S)
        for m in field_pattern.finditer(content):
            raw = m.group(3).replace('\\n', ' ').replace('\\\'', "'").replace('\\"','"')
            add(rows, seen, source, content.count('\n',0,m.start())+1, m.group(1), raw, 'campo_js')
        # Texto JSX/HTML entre etiquetas: solo texto literal, no expresiones.
        for m in re.finditer(r'>\s*([^<>{}\n][^<>{}]{7,350}?)\s*<', content):
            add(rows, seen, source, content.count('\n',0,m.start())+1, 'texto_visible', m.group(1), 'jsx_html')
        if file.suffix == '.md':
            for i, line in enumerate(content.splitlines(),1):
                if line.strip().startswith(('# ', '## ', '### ')):
                    add(rows, seen, source, i, 'encabezado', line.lstrip('# '), 'markdown')
    columns = ['id','archivo','linea','campo','texto','dominio_sugerido','intencion_sugerida','estado','metodo']
    with (out/'inventario_contenido.csv').open('w', encoding='utf-8-sig', newline='') as f:
        w=csv.DictWriter(f, fieldnames=columns);w.writeheader();w.writerows(rows)
    (out/'inventario_contenido.json').write_text(json.dumps(rows,ensure_ascii=False,indent=2),encoding='utf-8')
    # Las sugerencias son etiquetas a revisar, NO ejemplos de entrenamiento validados.
    suggestions=[{'fuente_id':r['id'],'dominio_propuesto':r['dominio_sugerido'],
                  'intencion_propuesta':r['intencion_sugerida'],'evidencia':r['texto'],
                  'ejemplos_usuario':[],'respuesta_aprobada':'','aprobado':False}
                 for r in rows if r['intencion_sugerida']!='sin_clasificar']
    (out/'borrador_intenciones.json').write_text(json.dumps(suggestions,ensure_ascii=False,indent=2),encoding='utf-8')
    counts={}
    for r in rows: counts[r['dominio_sugerido']]=counts.get(r['dominio_sugerido'],0)+1
    report=['# Informe de extracción','',f'- Archivos examinados: {len(scanned)}',f'- Fragmentos encontrados: {len(rows)}',
            f'- Intenciones sugeridas: {len(suggestions)}','',
            '## Distribución preliminar de dominios']
    report += [f'- {k}: {v}' for k,v in sorted(counts.items())]
    report += ['', '## Advertencias', '- Extracción estática heurística: no ejecuta la web ni resuelve imports.',
               '- Los datos pueden ser ficticios, publicitarios, incompletos o estar duplicados.',
               '- No convierte textos publicitarios en preguntas reales de usuarios.',
               '- Revisar manualmente las etiquetas, crear ejemplos de usuario y aprobar respuestas antes de entrenar.',
               '- No incorporar datos personales de pacientes sin autorización y anonimización.',
                '- El extractor solo lee js/contenido.js de js/ y excluye entrenamiento, modelo y librerias.',
               '', '## Archivos examinados'] + [f'- `{x}`' for x in scanned]
    (out/'INFORME.md').write_text('\n'.join(report)+'\n',encoding='utf-8')
    print(f'Listo. {len(scanned)} archivos analizados; {len(rows)} fragmentos extraidos.')
    print(f'Resultados: {out}')

if __name__=='__main__': main()
