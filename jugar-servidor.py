#!/usr/bin/env python3
"""Sirve Periodica en http://127.0.0.1:5173 sin instalar Node."""
from __future__ import annotations

import http.server
import os
import socketserver
import sys
import webbrowser

ROOT = os.path.dirname(os.path.abspath(__file__))
os.chdir(ROOT)
PORT = 5173


class Handler(http.server.SimpleHTTPRequestHandler):
    extensions_map = {
        **http.server.SimpleHTTPRequestHandler.extensions_map,
        ".js": "text/javascript",
        ".mjs": "text/javascript",
        ".css": "text/css",
        ".html": "text/html",
        ".json": "application/json",
        ".svg": "image/svg+xml",
    }

    def log_message(self, format, *args):
        return


class ReusableServer(socketserver.TCPServer):
    allow_reuse_address = True


def main():
    try:
        httpd = ReusableServer(("127.0.0.1", PORT), Handler)
    except OSError:
        print(f"No se pudo abrir el puerto {PORT}. Cierra otra ventana de Periodica.")
        return 1
    url = f"http://127.0.0.1:{PORT}/"
    print()
    print(f"  Periodica está abierto en {url}")
    print("  No cierres esta ventana mientras juegas.")
    print()
    webbrowser.open(url)
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nCerrado.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
