#!/usr/bin/env python3
"""Il server delle prove locali, e serve solo a una cosa: **non far tenere in
cache niente**.

`python3 -m http.server` non manda nessun `Cache-Control`. Il browser allora
decide da solo per quanto tenersi una pagina, e la regola che usa guarda quanto
è vecchio il file: un `ufficio.html` modificato l'ultima volta due giorni fa
viene considerato buono per ore. Tu lo modifichi, ricarichi, e vedi quello di
prima — senza nemmeno una domanda al server.

Sui `.js` il problema non si vede, perché `ufficio.html` li chiama con un numero
che cambia a ogni apertura. Ma quel numero sta **dentro** la pagina, e la pagina
nessuno la busta: è il buco esatto in cui è caduto il 2026-08-23 l'elenco degli
script quando ci è entrato `domande.js`. La pagina vecchia caricava i file nuovi,
`Domande` non esisteva, e cambiare sezione non faceva più niente.

    python3 servi.py 8010

Non è un pezzo dell'app: fuori di qui il sito sta su Netlify, dove la cache
serve davvero.
"""

import http.server
import socketserver
import sys


class SenzaCache(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        super().end_headers()

    def send_header(self, keyword, value):
        # `SimpleHTTPRequestHandler` manda un `Last-Modified` su ogni file, e
        # basta quello a far ripartire la cache euristica: si toglie.
        if keyword.lower() == 'last-modified':
            return
        super().send_header(keyword, value)

    def log_message(self, formato, *args):
        pass                      # una riga per file servito non serve a nessuno


if __name__ == '__main__':
    porta = int(sys.argv[1]) if len(sys.argv) > 1 else 8010
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(('', porta), SenzaCache) as server:
        print('the-office · http://localhost:%d/ufficio.html' % porta)
        try:
            server.serve_forever()
        except KeyboardInterrupt:
            pass
