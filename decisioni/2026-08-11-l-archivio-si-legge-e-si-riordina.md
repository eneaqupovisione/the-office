# L'app cresce in quattro schermate, e l'archivio si legge ma non si riscrive

data: 2026-08-11 · stato: attiva
**sostituisce** la decisione «un canale di cattura scrive solo» (nodo → *Deciso*)
e il divieto §4 del `CLAUDE.md` («non aggiungere una lista sfogliabile»).

**Contesto.** La prima fetta era la sola cattura, schermata unica, e funziona.
Ma con le catture chiuse dentro `localStorage` e nessun modo di vederle, l'app
«non fa praticamente nulla» finché non si esporta: si scrive al buio. Nel
frattempo il numero dei progetti è cresciuto e i nomi scritti a mano
divergevano (`cantera`, `Cantera`), cioè il raggruppamento si sporcava alla
fonte — esattamente il problema che il metodo evita altrove.

**Alternative considerate.**

- **Restare a schermata unica** e aspettare la sincronizzazione, guardando le
  catture solo dentro `~/the-knowledge`. Scartata: la sincronizzazione dipende
  da tre cose che non sono ancora state fatte (repo, Netlify, token), e nel
  frattempo l'unico modo di rivedere una cattura è esportarla. L'attesa non era
  di giorni ma indefinita.
- **Aprire sull'elenco, con la cattura dietro un bottone** (la forma di quasi
  tutte le app di note). Scartata **nel merito**: il progetto esiste per i
  cinque secondi. Una schermata in mezzo li mangia tutti, e l'app diventerebbe
  un posto dove si guarda invece di uno dove si butta dentro.
- **Archivio con modifica del testo.** Scartata: il nodo dichiara che l'app non
  deve diventare il posto dove si scrive, si ragiona, si ristruttura — su quel
  terreno Claude Code è più forte di qualunque interfaccia. Non è un limite
  tecnico, è il confine del progetto.
- **Quattro schermate dietro un menu laterale, con la cattura per prima.** —
  **scelta.**

**Decisione.** L'app ha quattro sezioni — cattura, archivio, progetti,
impostazioni — raggiungibili da un menu laterale, con due vincoli che le tengono
oneste:

1. **L'apertura atterra sempre sul lampo**, col fuoco già nel testo. Le altre
   sezioni costano un gesto in più, sempre, e non compaiono mai davanti.
2. **Nell'archivio si cambia l'etichetta, non il testo.** Tipo e progetto sì —
   correggerli *è* smistamento. Il corpo della cattura non è modificabile.

I progetti nascono da soli dai nomi già scritti in cattura, e si possono
aggiungere a mano o leggere dai repo pubblici di GitHub. **Restano suggerimenti:
l'appartenenza in cattura è e resta facoltativa** (METODO §1: la cattura non
chiede permesso).

**Perché.** Perché la ragione scritta del divieto era *«è ciò che tiene il
problema piccolo»* — e il problema è rimasto piccolo per un motivo diverso da
quello che credevamo: non perché non si può guardare, ma perché la schermata
d'apertura è una sola e non chiede niente. Il presidio vero è **dove atterra
l'app**, non l'assenza di una lista.

**Conseguenze.**

- **Il rischio da sorvegliare è il tempo speso a navigare invece che a
  catturare.** Se fra un mese l'archivio è la schermata più aperta, questa
  decisione ha fallito e va riaperta — non aggiustata.
- **Il confine «si legge, non si riscrive» è la cosa fragile.** Il prossimo
  passo naturale sarebbe un campo di testo modificabile nell'archivio: è lì che
  l'app inizierebbe a competere con Claude Code, e da lì non si torna indietro.
- **Il contatore adesso sta in due posti** (menu e testata) perché deve essere
  visibile in tutte e due le impaginazioni. Resta sacro, e conta ciò che **non è
  ancora uscito** dal dispositivo, non il totale.
- **Il codice non è più un file solo.** `app.js` si è diviso in sette pezzi con
  un ruolo ciascuno; restano `<script>` normali senza costruzione né moduli,
  perché `index.html` deve continuare ad aprirsi da file e funzionare.
