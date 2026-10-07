#!/usr/bin/env python3
"""
Servidor local HTTP para testar a Fast Page de Project Finance.
Uso: python serve.py [porta]
"""

import http.server
import socketserver
import os
import sys

# Força UTF-8 na saída padrão do Windows
if sys.platform == 'win32':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8088
DIRECTORY = os.path.dirname(os.path.abspath(__file__))

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def end_headers(self):
        # Desativa cache agressivo durante desenvolvimento local
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        super().end_headers()

def run():
    os.chdir(DIRECTORY)
    with socketserver.TCPServer(("", PORT), Handler) as httpd:
        url = f"http://localhost:{PORT}/index.html"
        print("=" * 65)
        print(">> PASSO 6 - RADAR DO ESTRUTURADOR: PROJECT FINANCE")
        print(f">> Servidor local ativo em: {url}")
        print(">> Pressione Ctrl+C para encerrar o servidor.")
        print("=" * 65)
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nServidor encerrado.")

if __name__ == "__main__":
    run()
