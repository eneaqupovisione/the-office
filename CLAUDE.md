# CLAUDE.md — planimetria di The Office

> Se una cosa qui contraddice il codice, **vince il codice**: aggiorna questo file.

> Questo file dice *dove sono le cose*. *Perché sono così* sta in [`decisioni/`](decisioni/).

> Il **perché esiste** sta nel nodo: `~/the-knowledge/prodotti/the-office/README.md`.
> **Leggilo prima di proporre scelte di impostazione.** Contiene le tre cose che
> l'app deve fare, le tre che **non** deve fare, e un elenco di decisioni già
> prese che sembrano domande aperte e non lo sono.

## Cos'è

> **È uno strumento, non un prodotto** (nodo, 2026-08-12). Serve a Enea e non ha
> compratori: prezzo, mercato e modello di ricavo **non sono domande aperte, non
> sono pertinenti**. Il criterio con cui si giudica una scelta di aspetto o di
> interazione non è il posizionamento — non esiste — ma la destinazione d'uso:
>
> **si apre molte volte al giorno, spesso di sera, con una mano sola, per meno
> di cinque secondi alla volta.**
>
> Una proposta che non regge questa frase si scarta prima di costruirla.

La porta di [The Knowledge](https://github.com/eneaqupovisione/the-knowledge):
cattura senza attrito, da telefono e da computer. Pagina web installabile,
**nessuna dipendenza, nessun passo di costruzione**: si apre `index.html` e
funziona.

**Cosa non è, oggi.** Delle tre funzioni previste dal nodo è costruita la
**prima**, con intorno il minimo che la rende utilizzabile davvero: un archivio
che si legge, i progetti, un ponte verso `_inbox`. La vista trasversale delle
scadenze e il ritorno sulle idee vecchie non esistono — non sono a metà: non ci
sono, e leggono l'albero, quindi arrivano dopo la sincronizzazione.

**Cosa non deve diventare mai.** Un posto dove si scrive, si ragiona o si
ristruttura. Su quel terreno Claude Code è più forte di qualunque interfaccia, e
il nodo lo dichiara come limite del progetto, non come stato attuale. È il
motivo per cui nell'archivio si cambia l'etichetta di una cattura e **non il suo
testo**.

## La planimetria

| File | Ruolo | Note operative |
|---|---|---|
| `index.html` | le quattro schermate e il menu | è l'unico documento: le sezioni si mostrano e si nascondono |
| `stile.css` | l'aspetto | **impaginazione San Francisco, palette 06** (→ `decisioni/2026-08-12-la-via-di-mezzo.md`). Carattere di sistema, l'acido come unico accento. Chiaro di base, progettata a 375px; da 900px il menu resta fisso |
| `dati.js` | il modello e il magazzino | 7 tipi, catture, progetti (con la loro `forma`), impostazioni. **Nessuna chiamata di rete** |
| `media.js` | gli allegati, in transito | IndexedDB e non `localStorage`: una foto in base64 satura la quota e uccide la cattura |
| `netlify/functions/cattura.js` | **il portiere** — l'unico pezzo che gira su un server | ci vive il token. Non conosce il formato di una cattura: riceve percorso e contenuto già composti. Senza dipendenze e corto, o muore il piano B |
| `ponte.js` | come le catture escono di qui | si collega **la radice** `~/the-knowledge`: scrive in `_inbox/` e `_inbox/media/`, e legge la `forma:` dei progetti. Il formato lo comanda `METODO.md` §6 |
| `cattura.js` | il lampo | la schermata che si apre e riceve il fuoco |
| `archivio.js` | leggere e rietichettare | raggruppa per progetto; il testo non è modificabile |
| `progetti.js` | i nomi dei progetti | **l'unico punto che tocca la rete**: legge i repo pubblici di GitHub, senza token |
| `impostazioni.js` | ponte, tema, svuota | ci vive anche l'avviso su ciò che ancora non c'è |
| `app.js` | avvio, navigazione, contatore | `App.aggiorna()` è il solo punto da chiamare dopo un cambiamento |
| `sw.js` | il guscio offline | cache-first. Alzare `VERSIONE` **e l'elenco dei file** a ogni cambio, o l'app non si aggiorna |
| `manifest.webmanifest` · `icona.svg` | installabilità | |
| `decisioni/` | perché è così | una decisione per file |
| `trappole.md` | ciò che sembra vero e non lo è | |

Sono `<script>` normali, non moduli: i moduli non si caricano da `file://`, e
`index.html` deve continuare ad aprirsi come file.

## Il flusso dei dati

```
lampo → textarea → localStorage['the-office.catture']   (immediato, sincrono)
                        ↓
        ┌───────────────┼────────────────┐
   sincronizzazione  cartella collegata  «esporta»
   (ovunque, da sola)
   (computer, Chromium,        (ovunque, telefono compreso)
    https o localhost)                  │
        │  un .md per cattura,     un .md con dentro tutti i blocchi
        │  scritto da solo                │
        └───────────────┬────────────────┘
                        ↓
              ~/the-knowledge/_inbox/*.md
                        ↓
                  smistamento (Claude Code, su un branch)
```

**Non c'è nessun server, nessun database, nessun account.** I dati vivono nel
browser del dispositivo finché non escono da una delle due strade. Una cattura
che non è uscita è **una cattura a rischio**: è quello che conta il contatore.

## Dove NON mettere le mani

1. **Non aggiungere campi obbligatori alla cattura.** Il testo è l'unica cosa
   necessaria; tipo e appartenenza sono facoltativi e restano facoltativi. È il
   primo principio del metodo, non una preferenza di interfaccia.
2. **Non introdurre una chiamata di rete nel percorso del salvataggio.** La
   scrittura nella cartella collegata è disco locale e viene **dopo** il
   salvataggio: se fallisce, la cattura è già al sicuro. La sincronizzazione,
   quando arriverà, sta anche lei dopo.
3. **Nessun segreto in questo repo.** Il token GitHub vivrà in una funzione lato
   server, mai nel dispositivo e mai nel bundle. Una chiave finita qui è pubblica
   per sempre, anche dopo il commit che la toglie. La lettura dei repo pubblici
   non ne usa nessuno, ed è l'unica cosa che l'app chiede alla rete.
4. **L'apertura atterra sul lampo.** Sempre, col fuoco già nel testo. L'archivio
   esiste (→ `decisioni/2026-08-11-l-archivio-si-legge-e-si-riordina.md`, che
   rovescia il vecchio divieto) ma costa un gesto in più, e non deve mai
   diventare la schermata d'ingresso: lì muoiono i cinque secondi.
5. **Nell'archivio non si modifica il testo di una cattura.** Tipo e progetto
   sì — correggerli *è* smistamento. Il corpo no: è il confine oltre il quale
   l'app comincia a competere con Claude Code.
6. **Il contatore è sacro** e sta sempre in vista, in tutte e due le
   impaginazioni. Conta ciò che **non è ancora uscito** dal dispositivo, non il
   totale. Senza, la fiducia crolla in due settimane.
7. **Il colore dice il tipo, e nient'altro.** Le sette coppie `--c-*` / `--f-*`
   di `stile.css` — testo dell'etichetta e fondo del foglietto — non si usano
   per stati, progetti o decorazione. Se si aggiunge un tipo gli si dà una
   coppia lì; se si toglie una coppia, si toglie il tipo. L'acido è un'altra
   cosa ancora: è **ciò che si tocca**, ed è l'unico accento. Il mono sta solo
   dove c'è un dato — appena diventa la voce delle etichette, torna il tono da
   rapporto tecnico che è stato tolto apposta.
8. **Nessun webfont, e non è una svista.** I caratteri sono quelli di sistema:
   un `@font-face` da un CDN sarebbe una dipendenza di rete e romperebbe
   l'apertura da `file://`. La direzione chiede tipografia ordinaria proprio
   per questo (→ `decisioni/2026-08-12-…`). Un carattere si aggiunge solo
   mettendone il file nel repo.

## Se il lavoro riguarda…

- **il metodo, dove va una cosa, una decisione** → `~/the-knowledge/METODO.md`
- **l'ordine del repo** → skill `repo-in-ordine`
- **il formato dei file dell'inbox** → `~/the-knowledge/METODO.md` §6, ed è la
  sorgente di verità: se `ponte.js` e il metodo divergono, **vince il metodo**
