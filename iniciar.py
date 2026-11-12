"""Servidor local de la página: usa un puerto LIBRE y abre el navegador.
Ejecutar con iniciar.bat (Windows) o iniciar.command (Mac/Linux)."""
import http.server, mimetypes, os, sys, threading, webbrowser

os.chdir(os.path.dirname(os.path.abspath(__file__)))
# Tipos de archivo correctos (en Windows .js a veces se sirve mal y los módulos no cargan)
for ext, tipo in [('.js', 'text/javascript'), ('.mjs', 'text/javascript'), ('.glb', 'model/gltf-binary'), ('.svg', 'image/svg+xml')]:
    mimetypes.add_type(tipo, ext)

class Manejador(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control', 'no-store')           # siempre la versión más reciente de los archivos
        super().end_headers()
    def log_request(self, code='-', size='-'):                  # solo muestra errores
        if str(code).isdigit() and int(code) >= 400 and 'avatar.jpg' not in self.path:
            print('  aviso:', code, self.path)

servidor = None
for puerto in range(8765, 8800):                                # busca un puerto libre
    try:
        servidor = http.server.ThreadingHTTPServer(('127.0.0.1', puerto), Manejador)
        break
    except OSError:
        continue
if servidor is None:
    sys.exit('No se encontró ningún puerto libre entre 8765 y 8799.')

url = f'http://127.0.0.1:{puerto}/' + ''
print('=' * 60)
print(' Clínica Dra. Janet - página lista en:', url)
print(' Deje esta ventana abierta. Ciérrela para detener el servidor.')
print('=' * 60)
if '--sin-navegador' not in sys.argv:
    threading.Timer(0.8, lambda: webbrowser.open(url)).start()
try:
    servidor.serve_forever()
except KeyboardInterrupt:
    pass
