/* ═══════════════════════════════════════════════════════════════════════════
   Service worker — serve a una cosa sola: **la cattura funziona senza rete.**
   Il lampo arriva in ascensore, in metropolitana, in campagna. Un'app di
   cattura che si apre bianca quando non c'è segnale ha fallito nel momento
   esatto in cui serviva.

   Strategia: cache-first sul guscio. Il guscio è tutto ciò che c'è — non ci
   sono dati remoti da tenere freschi, perché i dati stanno in locale.
   ═══════════════════════════════════════════════════════════════════════ */

/* Questo numero sta in due posti: qui e nelle `?v=` di `index.html`.
   Devono coincidere, o il guscio in cache e il documento vanno fuori fase. */
const VERSIONE = 'the-office-v8';
const GUSCIO = [
  './',
  './index.html',
  './stile.css',
  './dati.js',
  './media.js',
  './ponte.js',
  './cattura.js',
  './archivio.js',
  './progetti.js',
  './impostazioni.js',
  './app.js',
  './icona.svg',
  './icona-180.png',
  './icona-512.png',
  './manifest.webmanifest'
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(VERSIONE).then(c => c.addAll(GUSCIO)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  // una versione nuova butta le vecchie: due gusci in memoria producono
  // l'app che «non si aggiorna mai» e nessuno capisce perché
  e.waitUntil(
    caches.keys()
      .then(nomi => Promise.all(nomi.filter(n => n !== VERSIONE).map(n => caches.delete(n))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request).then(trovato => trovato || fetch(e.request))
  );
});
