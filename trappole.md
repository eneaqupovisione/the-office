# Trappole

> Le cose che **sembrano vere e non lo sono**. Si scrivono prima di risolverle,
> perché spesso non si risolvono — e allora almeno resta l'avviso.

La più recente in alto.

---

**Da adesso l'albero cambia anche quando tu non lo tocchi.** Con la
sincronizzazione attiva, una cattura fatta dal telefono finisce nel repo **su
GitHub** — non nel `~/the-knowledge` che hai sul Mac. Il locale non lo sa
finché non fai `git pull`, e Claude Code lavora sul locale: **«smista l'inbox»
non vedrebbe le catture di oggi.** Da qui in avanti l'inbox si smista così:

```bash
cd ~/the-knowledge && git pull      # prima di ogni smistamento
```

E vale anche al contrario: se il locale è avanti e non l'hai spinto, il portiere
scrive su una base più vecchia della tua. **Prima di catturare per giorni, spingi
il locale.** *(2026-08-12)*

**«Cartella collegata» non vuol dire «collegata al mio account».** Sono due cose
diverse e il nome trae in inganno: la cartella collegata è un permesso del
browser su una cartella di **quel disco**, e su iOS Safari quell'API non esiste
— non è un permesso da concedere, la funzione non c'è. Il collegamento
all'account è un'altra cosa (la sincronizzazione, via API) e funziona ovunque.
E non basta un pulsante «accedi con GitHub»: per un repo privato serve una
credenziale, lo scambio finale di OAuth non è permesso da un browser, e un token
utente sul telefono potrebbe molto più del necessario. **Da qualunque parte si
giri serve la funzione lato server** — non è un giro largo, è l'unico modo di
collegarsi senza portarsi le chiavi in tasca. *(2026-08-12)*

**Le catture non seguono l'app da un indirizzo all'altro.** `localStorage` è
legato all'**origine**: quello che hai catturato aprendo `index.html` come file
non c'è aprendo `https://…netlify.app`, e viceversa. Non sono sparite — stanno
in un altro cassetto, e ogni cassetto ha il suo contatore. Vale anche fra il
telefono e il computer, che sono due dispositivi e quindi due cassetti: è
esattamente il problema che la sincronizzazione esiste per chiudere.
**Prima di adottare l'indirizzo nuovo come quello buono, esporta dal vecchio.**
*(2026-08-12)*

**Il nome del sito non è il nome del prodotto.** L'indirizzo è
`ufficio-smistamento-idee.netlify.app`, il prodotto si chiama The Office e la
cartella pure (`moduli/codice/SKILL.md` §7 vuole che coincidano). Cambiarlo è un
campo in Netlify e costa zero **adesso**; costa un'app da reinstallare e un
segnalibro morto **dopo** che l'hai messa sulla schermata home. *(2026-08-12)*

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

**L'icona voleva un PNG, e non era un forse.** iOS ignora un `apple-touch-icon`
in SVG e mette una miniatura della pagina al posto dell'icona. Risolto il
2026-08-12 generando `icona-180.png` e `icona-512.png` dal solo SVG, che resta
la sorgente: se cambia il disegno si rigenerano con
`rsvg-convert -w 180 -h 180 icona.svg -o icona-180.png`, non si ridisegnano.
*(2026-08-10, chiusa il 2026-08-12)*

**`contatto` è il settimo tipo, ed è in prova.** In `dati.js` è l'unico con
`prova:true` — il CSS gli disegna un punto dopo l'etichetta — ed è l'unico il cui
campo `dove` non nomina un file di destinazione. Non è una dimenticanza da
correggere «per coerenza». *(2026-08-10)*
