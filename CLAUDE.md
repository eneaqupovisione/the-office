# CLAUDE.md — planimetria di The Office

> Se una cosa qui contraddice il codice, **vince il codice**: aggiorna questo file.

Pagina web installabile per catturare testo in fretta, da telefono e da computer.
**Nessuna dipendenza, nessun passo di costruzione**: si apre `index.html` e
funziona.

## La planimetria

| File | Ruolo | Note operative |
|---|---|---|
| `index.html` | le quattro schermate e il menu | è l'unico documento: le sezioni si mostrano e si nascondono |
| `stile.css` | l'aspetto | carattere di sistema, l'acido come unico accento. Chiaro di base, progettato a 375px; da 900px il menu resta fisso |
| `dati.js` | il modello e il magazzino | catture, progetti (con la loro `forma`), impostazioni, e `riconosci()` — che legge il nome del progetto dalla prima riga **confrontando parole, non indovinando**. **Nessuna chiamata di rete** |
| `media.js` | gli allegati, in transito | IndexedDB e non `localStorage`: una foto in base64 satura la quota e uccide la cattura |
| `netlify/functions/cattura.js` | **il portiere** — l'unico pezzo che gira su un server | ci vive il token. Non conosce il formato di una cattura: riceve percorso e contenuto già composti. Senza dipendenze e corto, o muore il piano B |
| `ponte.js` | come le catture escono di qui, e come si leggono i file dell'albero | si collega **la radice** `~/the-knowledge`: scrive in `_inbox/` e `_inbox/media/`, legge la `forma:` dei progetti, e con `leggiTesto`/`scriviTesto` apre file qualsiasi dentro l'albero. Il formato del `.md` lo costruisce `testa()` |
| `cattura.js` | il lampo | la schermata che si apre e riceve il fuoco |
| `archivio.js` | leggere e rietichettare | raggruppa per progetto; il testo non è modificabile |
| `lavori.js` | il motore di commissioni e acquisti | legge le caselle `- [ ]` dai `.md` dell'albero. **Non riorganizza il file**: spuntare cambia un carattere, aggiungere inserisce una riga. Provabile da solo, non tocca il DOM |
| `agenda.js` | le schermate Commissioni e Acquisti | ogni gesto riscrive il file e poi **rilegge**: il file è la verità, e Claude Code può cambiarlo mentre l'app è aperta |
| `progetti.js` | i nomi dei progetti | li legge dalla cartella collegata o dai repo pubblici di GitHub, senza token |
| `impostazioni.js` | sincronizzazione, ponte, tema, svuota | ci vive la chiave d'app. `statoVero()` **calcola** dove finiscono le catture: nessuno stato scritto a mano |
| `app.js` | avvio, navigazione, contatore | `App.aggiorna()` è il solo punto da chiamare dopo un cambiamento |
| `sw.js` | il guscio offline | cache-first. Alzare `VERSIONE` **e l'elenco dei file** a ogni cambio, o l'app non si aggiorna |
| `manifest.webmanifest` · `icona.svg` · `icona-*.png` | installabilità | i PNG servono a iOS, che ignora l'SVG. Si **rigenerano** dall'SVG, non si ridisegnano |
| `netlify.toml` | dove sta la funzione | nessun `command`: non c'è costruzione |
| `trappole.md` | ciò che sembra vero e non lo è | |

Sono `<script>` normali, non moduli: i moduli non si caricano da `file://`, e
`index.html` deve continuare ad aprirsi come file.

**Il numero di versione sta in due posti** — `VERSIONE` in `sw.js` e le `?v=` di
`index.html`. Devono coincidere, o il guscio in cache e il documento vanno fuori
fase.

## Le sei sezioni, e due famiglie

| | Dove vivono i dati | Quando si ridisegna |
|---|---|---|
| **Idee** (l'apertura) · **Archivio** · **Progetti** | `localStorage`, poi le tre strade verso `_inbox/` | a ogni `App.aggiorna()`: costa niente |
| **Commissioni** · **Acquisti** | file veri nell'albero, letti e riscritti sul posto | solo entrando nella sezione: leggere venti file a ogni cattura salvata sarebbe sprecato |

**Commissioni** è la vista su `clienti/`: una scheda per cartella, e le cose da
fare sono le caselle `- [ ]` del suo `prossimi-passi.md`. **Acquisti** è un file
solo, `personale/acquisti.md`, con tre liste. Tutte e due vogliono la **radice**
collegata e Chromium sul computer: senza, la sezione dice cosa manca invece di
mostrare una lista vuota.

**Nella cattura non c'è più la griglia dei tipi.** Al lampo l'unica cosa che sai
e che un agente non può dedurre è di quale progetto si tratta: è l'unico campo
rimasto. Il campo `tipo` resta nel modello per le catture già fatte, e nei file
nuovi semplicemente non compare.

## Il flusso dei dati

```
lampo → textarea → localStorage['the-office.catture']   (immediato, sincrono)
                        ↓
   ┌────────────────────┼────────────────────┐
   │                    │                    │
sincronizzazione   cartella collegata    «esporta»
(ovunque, da sola)  (computer, Chromium,  (ovunque, a mano)
   │                 https o localhost)       │
   │  POST al portiere      │  un .md per      │  un .md con dentro
   │  → API GitHub          │  cattura         │  tutti i blocchi
   ↓                        ↓                  ↓
        ~/the-knowledge/_inbox/<progetto>/*.md
```

Il formato del file che esce:

```
---
tipo: idea                 # facoltativo
progetto: cantera          # facoltativo
origine: the-office
stato: da-smistare
allegati: media/…          # solo se ce ne sono
---

il testo della cattura
```

**Nessun database, nessun account, e un solo pezzo di server** — il portiere, che
esiste per tenere il token e nient'altro. I dati vivono nel browser del
dispositivo finché non escono da una delle tre strade. Il contatore conta le
catture che non sono ancora uscite.

## Vincoli tecnici

1. **Niente chiamate di rete nel percorso del salvataggio.** La sincronizzazione
   parte **dopo** che la cattura è in `localStorage`; se fallisce, la cattura
   resta «in attesa» e riparte al giro dopo. Il salvataggio non aspetta mai la
   rete, o offline si perde tutto.
2. **Nessun segreto in questo repo.** Il token GitHub vive **solo** in
   `GITHUB_TOKEN` fra le variabili d'ambiente di Netlify. Una chiave finita qui è
   pubblica per sempre, anche dopo il commit che la toglie. Sul dispositivo c'è
   soltanto la `CHIAVE_APP`, che apre l'aggiunta di file in `_inbox/` e
   nient'altro — e si cambia in dieci secondi.
3. **Nessun webfont.** Un `@font-face` da un CDN è una dipendenza di rete e
   rompe l'apertura da `file://`. Un carattere si aggiunge solo mettendone il
   file nel repo.
4. **Il testo di una cattura non si modifica nell'archivio.** Tipo e progetto sì.
   Per il corpo non esiste un campo, ed è voluto.
5. **`lavori.js` non riscrive mai un file intero.** Un `prossimi-passi.md` vero
   ha dentro prosa, titoli e tabelle oltre alle caselle: rigenerarlo sarebbe il
   modo più veloce di perdere qualcosa. Spuntare cambia un carattere della sua
   riga, aggiungere inserisce una riga sola.
6. **Ogni scrittura rilegge il file un istante prima.** Se l'hai toccato da
   Claude Code mentre l'app era aperta, si lavora sulla versione vera.
