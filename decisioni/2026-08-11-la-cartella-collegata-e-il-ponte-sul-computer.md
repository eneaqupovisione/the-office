# La cartella collegata è il ponte sul computer, e la rete serve solo a leggere

data: 2026-08-11 · stato: attiva

**Contesto.** «Poter accedere via codice alle idee registrate, già strutturate»:
cioè catturo, e Claude Code trova i file in `~/the-knowledge/_inbox` senza che
io faccia niente. La sincronizzazione vera passa da repo pubblicato, sito
Netlify e token — tre cose che deve fare Enea e che al 2026-08-11 non esistono.
La domanda era se aspettarle o se esiste una strada intanto.

**Alternative considerate.**

- **Aspettare la sincronizzazione.** Scartata per la stessa ragione della
  decisione gemella di oggi: l'attesa non ha una data.
- **Un token GitHub messo nell'app e tenuto in `localStorage`.** Scartata, e va
  nominata perché è la scorciatoia che chiunque proporrebbe: renderebbe
  automatico anche il telefono, subito. **Rompe una decisione già presa**
  (`CLAUDE.md` §3: nessun segreto nel dispositivo e nel bundle), e un token con
  scrittura su `the-knowledge` in mano al browser è una chiave che gira.
- **Un piccolo server locale sul Mac.** Scartata: *«niente che dipenda dal Mac
  acceso»* è scritto nel nodo.
- **La cartella collegata** (File System Access): il browser chiede una volta il
  permesso su `_inbox`, e da lì in poi l'app ci scrive dentro file `.md` veri.
  — **scelta**, insieme all'esportazione che resta come ripiego universale.

**Decisione.** Due strade, e la prima è automatica solo dove il browser la
sostiene:

1. **Cartella collegata** — computer, browser Chromium, contesto sicuro
   (`https` o `localhost`). Ogni cattura diventa un file in `_inbox` **subito
   dopo** il salvataggio locale, senza gesti. La maniglia della cartella vive in
   IndexedDB e sopravvive alla chiusura del browser.
2. **Esportazione** — ovunque, telefono compreso, con un gesto. Un `.md` con
   dentro tutti i blocchi, più un `.json` per leggere l'archivio da codice.

La rete la tocca **un solo punto** dell'app: la lettura dei repo pubblici di
GitHub nella schermata Progetti, dietro un gesto esplicito e senza nessun token.

**Perché.** Perché scrivere su disco locale non è una chiamata di rete: la
decisione «local-first, nessuna rete nel percorso del salvataggio» resta intatta
parola per parola. E perché l'ordine conta — la cattura è al sicuro in
`localStorage` **prima** che la cartella venga toccata: se la scrittura del file
fallisce, la cattura resta «in attesa» e non se ne perde nessuna.

**Conseguenze.**

- **Il telefono non è coperto.** Su Safari iPhone la cartella non esiste, e
  l'automatico lì arriva solo con Netlify e il token. Finché non ci sono,
  telefono e computer restano due mucchi separati — e adesso lo dice anche un
  pannello dentro le impostazioni, per non ricordarselo a memoria.
- **Il permesso può scadere.** Il browser lo revoca dopo un po' che l'app non si
  apre: la cattura continua a salvarsi, ma smette di uscire. Per questo lo stato
  della cartella è scritto in chiaro nelle impostazioni invece di essere dato
  per buono. → `trappole.md`
- **`stato: da-smistare` nella testa dei file è un'etichetta, non un
  meccanismo.** Niente entra nei file strutturati senza passare dallo
  smistamento, che resta lavoro di Claude Code su un branch.
- **Il formato dei file lo comanda `METODO.md` §6.** Se i due divergono, si
  cambia `ponte.js`, mai il metodo.
