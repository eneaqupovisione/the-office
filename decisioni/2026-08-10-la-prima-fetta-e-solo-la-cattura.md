# La prima fetta è solo la cattura, e gira senza rete

data: 2026-08-10 · stato: attiva

**Contesto.** Il nodo prevede tre funzioni: cattura, vista trasversale, ritorno
sulle idee vecchie. Bisognava decidere da dove cominciare, e se partire subito
con il ponte verso il repo GitHub — che è l'orientamento già scritto — oppure
dopo.

**Alternative considerate.**

- **Tutte e tre insieme.** Scartata: la vista e il ritorno *leggono* l'albero,
  quindi richiedono la sincronizzazione prima di poter esistere. Sono valore
  differito; la cattura è il motivo per cui il progetto esiste.
- **Cattura + ponte GitHub subito.** Scartata per ora, non nel merito: richiede
  un repo pubblicato, un sito Netlify e un token — cioè tre cose che deve fare
  Enea, e nessuna delle quali si può provare stasera. Rimandarla non costa
  niente perché l'esportazione fa da ponte nel frattempo.
- **Una scorciatoia legata al sistema operativo** (es. una scorciatoia iOS che
  chiama direttamente l'API di GitHub): sarebbe la strada più rapida ai cinque
  secondi, e va nominata perché è tentante. **Esclusa da una decisione già
  presa nel nodo**: *«cross-platform, una sorgente sola, niente che dipenda dal
  Mac acceso»*. Non è stata riaperta.
- **Solo la cattura, local-first.** — **scelta.**

**Decisione.** Si costruisce la funzione 1 e basta: schermata unica, scrittura
immediata in `localStorage`, nessuna chiamata di rete, installabile e funzionante
offline. L'uscita dei dati passa da un'esportazione manuale.

**Perché.** Perché è ciò che il nodo aveva già deciso senza dirlo: *«local-first,
scrive subito in locale, la sincronizzazione viene dopo»* e *«il telefono è il
cuore»*. Costruire prima il ponte avrebbe significato rimandare l'unica cosa che
si può provare davvero — e la cosa da confermare è proprio che i cinque secondi
si tengano, non che GitHub risponda.

**Conseguenze.**

- **L'esportazione è un ponte provvisorio, non una funzione.** Produce un file
  solo con dentro tutti i blocchi, perché i browser bloccano i download multipli.
  Sparisce il giorno in cui esiste la sincronizzazione. Va trattata come debito
  dichiarato, non come comodità da migliorare.
- **I dati vivono nel browser di un dispositivo solo.** Finché non c'è
  sincronizzazione, catturare dal telefono e dal computer produce due mucchi
  separati. È accettabile per la prova, **non** per l'uso vero.
- **Il rischio è la cancellazione dei dati del sito** da parte del browser. Per
  questo `svuota` avverte quando ci sono catture mai esportate, ma è una
  protezione contro l'errore umano, non contro il browser. → `trappole.md`
- 🔲 Resta da confermare costruendo: pagina installabile + funzione Netlify che
  tiene il token. La decisione di oggi non la mette in discussione, la rimanda.
