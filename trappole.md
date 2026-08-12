# Trappole

> Le cose che **sembrano vere e non lo sono**. Si scrivono prima di risolverle,
> perché spesso non si risolvono — e allora almeno resta l'avviso.

La più recente in alto.

---

**«Sembra buggato» quasi sempre è la cache, non il codice.** Aprendo l'app
sempre dallo stesso `file://`, il browser può servirti `index.html` nuovo con
`stile.css` e i `.js` vecchi — e col markup nuovo e il JS vecchio l'app **muore
davvero**, non si imbruttisce soltanto. Dal 2026-08-12 ogni asset si carica con
`?v=N` e quel numero deve **coincidere con `VERSIONE` in `sw.js`**: si alzano
insieme, o il documento e il guscio in cache vanno fuori fase. Prima di cercare
un bug, controlla che i due numeri siano uguali. *(2026-08-12)*


**Il tema di partenza non è più scuro.** Dal 2026-08-12 l'app si apre chiara. Chi
aveva già usato l'app se la ritrova chiara **anche se non ha toccato niente** —
non è un bug, e «Notte» sta in Impostazioni. Il valore di partenza vive in
`Dati.IMPOST_DEFAULT`, non nel CSS: cambiarlo nel CSS non sposta niente.
*(2026-08-12)*

**Il colore dice il tipo, e solo quello.** Se qualcuno colora una cattura per
dire «già esportata», o dà a un progetto la sua tinta, la mappa si rompe in
silenzio: da quel momento il colore non è più leggibile a colpo d'occhio e
l'archivio torna da rileggere invece che da scorrere. Per stati e cornici ci
sono i grigi; per ciò che si tocca c'è l'accento blu. *(2026-08-12)*

**La cartella collegata non è la sincronizzazione, e il permesso scade.** Scrive
i file sul dispositivo da cui stai catturando, non nel repo: se colleghi la
cartella dal portatile, il telefono continua a non sapere niente. E il browser
revoca il permesso dopo un po' che l'app non si apre — da quel momento **la
cattura continua a salvarsi ma smette di uscire**, in silenzio. L'unica spia è
il contatore che cresce e lo stato scritto nelle impostazioni. *(2026-08-11)*

**Il contatore conta ciò che non è ancora uscito, non quante catture hai.**
`3 in attesa` con cento catture in archivio significa che novantasette sono già
in `_inbox`. Chi legge «3» come «ho catturato tre cose» sta leggendo un'altra
cosa. *(2026-08-11)*

**«Collega la cartella» può esserci e non funzionare.** Il bottone si accende se
il browser conosce la funzione, ma serve anche un contesto sicuro: da `https` o
da `localhost` sì, da un indirizzo di rete locale `http://192.168…` no. È il
caso in cui provi l'app dal telefono col server di prova e non capisci perché
lì non compare. *(2026-08-11)*

**La lettura da GitHub vede solo i repo pubblici, e non collega niente.** Non usa
token, quindi i repo privati non esistono per lei; e quello che fa è **copiare
un nome** nell'elenco dei progetti — non c'è nessun legame vivo fra un progetto
dell'app e la repo. Rinominare la repo su GitHub non cambia niente qui.
*(2026-08-11)*

**I dati stanno in un solo browser, e il browser può cancellarli.**
`localStorage` non è memoria permanente: iOS può liberarla se il sito non viene
aperto per settimane, e «cancella dati di navigazione» la porta via senza
chiedere. Finché non esiste la sincronizzazione, **una cattura non esportata è
una cattura a rischio.** L'avviso in `svuota` protegge dall'errore umano, non da
questo. *(2026-08-10)*

**Il telefono e il computer sono due mucchi separati.** Non c'è nessuna
sincronizzazione: quello che catturi su un dispositivo non esiste sull'altro.
Sembra un'app sola, sono due. *(2026-08-10)*

**`sw.js` serve il guscio dalla cache.** Se cambi un file e non alzi `VERSIONE`,
il dispositivo continua a servire la versione vecchia e sembrerà che le modifiche
non abbiano avuto effetto. È la prima cosa da sospettare quando «non si aggiorna».
Da quando i file JavaScript sono sette, c'è un secondo modo di sbagliare: **un
file nuovo non aggiunto a `GUSCIO` non viene messo in cache**, e l'app si apre
rotta appena manca la rete. *(2026-08-10, esteso il 2026-08-11)*

**L'icona è solo SVG.** Chrome e Android la accettano; 🔲 su iOS l'aggiunta alla
schermata home potrebbe volere un PNG — non verificato su un dispositivo vero.
*(2026-08-10)*

**`contatto` è il settimo tipo, ed è in prova.** Sta nell'interfaccia (segnato
con un punto) ma **non** in `METODO.md` §6, che di tipi ne ha sei. Non è una
dimenticanza: non sale finché non dimostra di pesare. Se qualcuno allinea i due
elenchi «per coerenza», rompe una decisione. *(2026-08-10)*
