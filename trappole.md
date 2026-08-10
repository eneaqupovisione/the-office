# Trappole

> Le cose che **sembrano vere e non lo sono**. Si scrivono prima di risolverle,
> perché spesso non si risolvono — e allora almeno resta l'avviso.

La più recente in alto.

---

**I dati stanno in un solo browser, e il browser può cancellarli.**
`localStorage` non è memoria permanente: iOS può liberarla se il sito non viene
aperto per settimane, e «cancella dati di navigazione» la porta via senza
chiedere. Finché non esiste la sincronizzazione, **una cattura non esportata è
una cattura a rischio.** L'avviso in `svuota` protegge dall'errore umano, non da
questo. *(2026-08-10)*

**Il telefono e il computer sono due mucchi separati.** Non c'è nessuna
sincronizzazione: quello che catturi su un dispositivo non esiste sull'altro.
Sembra un'app sola, sono due. *(2026-08-10)*

**`sw.js` serve il guscio dalla cache.** Se cambi `index.html`, `app.js` o
`stile.css` e non alzi `VERSIONE`, il dispositivo continua a servire la versione
vecchia e sembrerà che le modifiche non abbiano avuto effetto. È la prima cosa da
sospettare quando «non si aggiorna». *(2026-08-10)*

**L'icona è solo SVG.** Chrome e Android la accettano; 🔲 su iOS l'aggiunta alla
schermata home potrebbe volere un PNG — non verificato su un dispositivo vero.
*(2026-08-10)*

**`contatto` è il settimo tipo, ed è in prova.** Sta nell'interfaccia (segnato
con un punto) ma **non** in `METODO.md` §6, che di tipi ne ha sei. Non è una
dimenticanza: non sale finché non dimostra di pesare. Se qualcuno allinea i due
elenchi «per coerenza», rompe una decisione. *(2026-08-10)*
