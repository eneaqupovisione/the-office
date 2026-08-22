# CLAUDE.md — planimetria di The Office

> Se una cosa qui contraddice il codice, **vince il codice**: aggiorna questo file.

## ⚠️ Due app in questa cartella, e una sta sostituendo l'altra

Dal **2026-08-21** The Office sta cambiando mestiere. Non è più «cattura testo
in fretta dal telefono»: è **l'organizzazione dei progetti**, e serve a
risolvere tre cose precise — perdere un progetto sotto gli altri, non essere
stimolati a riprenderlo, e aver dimenticato le belle idee che si erano avute.

| | |
|---|---|
| `ufficio.html` + `radice.js` `passi.js` `ufficio.js` `ufficio.css` | **il nuovo**, e si apre da `localhost:8010` |
| `index.html` + tutto il resto | **il vecchio**, ancora intero e ancora in linea su Netlify |

**Il vecchio non si tocca finché non hai esportato le catture dal telefono.**
Quelle vivono nel `localStorage` dell'origine `ufficio-smistamento-idee.netlify.app`
e non stanno da nessun'altra parte: via sincronizzazione non ne è mai arrivata
nemmeno una su GitHub (`_inbox/` ha un file solo, del 10 agosto, messo a mano).
Spegnere il sito prima di esportare le cancella.

Il passaggio, quando sarà il momento, è una rinomina — e allora cadono
`sw.js`, `manifest.webmanifest`, le icone PNG, `netlify.toml`, il portiere e il
doppio numero di versione.

## La planimetria nuova

| File | Ruolo | Note operative |
|---|---|---|
| `ufficio.html` | il documento del nuovo | nessun `?v=`, nessun service worker, nessun manifest: si apre dal computer e basta |
| `seed.js` | **il disco finto di `?prova`** | un campionario dei casi, in `localStorage`. Si prova tutto senza toccare un file vero — e **anche su Safari**, dove `showDirectoryPicker` non esiste. Si cancella con la sua riga in `ufficio.html` quando non serve più |
| `radice.js` | `~/Lavori` collegata, e lo scandaglio | **calcola** il silenzio di ogni progetto dalla data di modifica dei file. Salta `node_modules` e compagnia — senza, `cantera` da sola sono 27.000 file — e si ferma a 400 file per progetto: il limite può far sembrare un progetto **più** silenzioso, mai più vivo. `attacca()` esiste solo per le prove |
| `passi.js` | il formato di `prossimi-passi.md` | perché · belle idee · da fare · fatte. Spuntare fa **scendere** la riga sotto `## Fatte` con la data, non la cancella. Ogni operazione dichiara che testo si aspetta di trovare e non fa niente se non combacia. **Non tocca il DOM: si prova da solo** |
| `ufficio.js` | le tre sezioni e la scheda | ogni gesto rilegge il file, scrive, rilegge |
| `ufficio.css` | l'aspetto | stessi nomi di colore di `stile.css`, così le due si fondono quando il vecchio si spegne |

## Le tre sezioni, e sono tre domande

| | risponde a | contiene |
|---|---|---|
| **Bacheca** | *cosa faccio adesso* | **una mossa per progetto**, e solo dei progetti toccati negli ultimi 14 giorni. Si spuntano lì: spuntata una, arriva la successiva dello stesso progetto |
| **Scrivania** | *cosa ho in mano* | **tutti** i progetti, per scadenza (due mucchi: qualcuno aspetta / nessuno aspetta) o per appartenenza (dentro la loro cartella) |
| **Rubrica** | *per chi lavoro* | i progetti raggruppati per `per:`, più quelli senza destinatario. È qui che nasce «un'idea per qualcuno» |

**La bacheca non è un censimento.** Mostra le mosse, non i progetti — e il
verso conta: quello che leggi per primo è la cosa da fare, il nome del lavoro
sta sotto e piccolo. Al contrario torna a essere un elenco di progetti, che è
esattamente quello che non deve essere.

`sol-y-mar` ha ventiquattro caselle aperte, e ventiquattro cose davanti non
sono uno stimolo: sono il motivo per cui richiudi. Una sì.

**Che i sepolti non compaiano in Bacheca è voluto** — deve restare corta o
smette di essere guardata. Ma allora devono stare *tutti* nella Scrivania,
compresi quelli fermi da mesi: se sparissero da tutte e due le sezioni,
l'app ricreerebbe il problema numero uno invece di risolverlo.

**Niente bottoni di servizio nella testata.** Lo scandaglio si rifà da solo
quando torni sulla finestra (mai mentre sei dentro una scheda: ti cancellerebbe
il campo da sotto le dita), e l'unico «aggiungi» dell'app sta nella Rubrica,
perché il posto dove nasce un'idea per qualcuno è l'elenco delle persone.

**In locale i `.js` si caricano con un numero che cambia a ogni apertura**
(`ufficio.html`, in fondo). Senza, modifichi un file, ricarichi e non cambia
niente — lo stesso male del vecchio `?v=12` da tenere allineato a mano, ma qui
il numero se lo scrive la macchina e non si può sbagliare.

**Un progetto è una cartella che ha il suo `prossimi-passi.md`**, e non c'è
nessun altro modo di diventarlo: lo dichiari tu, e dichiararlo è crearlo. Può
stare al primo livello (`tablewise`) o al secondo (`cantera/sommelier-engine`);
se un lavoro non ha nessun progetto dichiarato dentro, nell'elenco compare lui.

C'era una regola che indovinava — «se dentro c'è un `.md` o un `.json` allora è
un progetto» — ed è caduta lo stesso giorno contro `~/Lavori` vera: faceva
passare per progetti `vittoria/foto` (400 jpg e un `indice.json`),
`vittoria/contenuti` (un `SEGNAPOSTO.md`) e `vittoria/marca`. Quaranta righe di
elenco di cui trenta sbagliate. **L'app non indovina: propone soltanto, e solo
dentro la scheda di un lavoro.**

Su `prossimi-passi.md` The Office comanda e può spostare righe. **Su ogni altro
`.md` spunta e basta**: `sol-y-mar/sito/consegna.md` ha le caselle numerate e
intrecciate alla prosa, e spostarle distruggerebbe il documento.

## I tre campi, e perché non ce n'è un quarto

In front matter, in cima al `prossimi-passi.md`:

```markdown
---
per: Hotel Riva          # chi aspetta — facoltativo
entro: 2026-09-05        # l'unica cosa che genera pressione
chiuso: 2026-08-21       # una data, non un sì/no: sai anche quando hai deciso
---
```

**Non esiste un campo per il tipo di progetto, e non deve esistere.**
Commissione o demo cambia la conseguenza nel mondo, non cosa fa il programma:
una data è una data. Una categoria da tenere aggiornata a mano sarebbe solo una
cosa in più da sbagliare, e sarebbe sbagliata proprio sui progetti abbandonati.

Lo stato si deduce: `entro` futuro → **in corsa**; `entro` passato →
**scaduta**; niente `entro` → **libero**; c'è `chiuso` → **fuori dall'elenco**.

E la regola che ne discende: **si calcola tutto ciò che riguarda il passato**
(da quanto tace, quanto hai fatto), **si dichiara solo ciò che riguarda il
futuro** (per chi, entro quando, e se è chiuso). Il passato lasciato a mano
sarebbe vecchio; il futuro sul disco non c'è.

Quando una data passa, l'app fa **una domanda**, non una multa — e «lascio
perdere la data» è una risposta legittima che costa un tocco. Un'app che ti
mette in mora è un'app che smetti di aprire, che è il modo in cui uno strumento
contro l'abbandono viene abbandonato.

## Toccare l'interfaccia invece di descriverla

La struttura sta in cima a `ufficio.js` come **dato**, non sparsa nelle
funzioni: `SEZIONI`, `SCHEDA`, `MOSSA`, `MOSSA_TESTO`, `RIGA`. Ogni nome è la
chiave di un registro — `PEZZI`, `PARTE_MOSSA`, `PARTE_RIGA` — e ogni pezzo è
una funzione che riceve il contesto e restituisce un nodo, o `null` se non ha
niente da dire. **Un nome che non esiste viene saltato**: si toglie un pezzo
commentandolo.

Spostare le idee sotto le cose da fare, invertire il verso di una riga della
Bacheca, togliere una sezione: è cambiare una riga lassù. Serve a Enea per
riorganizzare senza passare da me, e serve perché **nessun editor visuale può
salvare uno spostamento se la struttura vive dentro le funzioni** — non
esisterebbe un posto in cui scriverlo.

E l'aspetto si tocca con `~/Attrezzi/studio-web`:

```bash
node ~/Attrezzi/studio-web/studio.mjs "~/Lavori/the-office" ufficio.html?prova
```

Il `?prova` non è un dettaglio: senza, dentro lo studio l'app chiederebbe una
cartella al browser invece di lasciarsi guardare. Da lì si toccano colori,
misure, caratteri e spaziature, e **salva** riscrive `ufficio.html` lasciando
una copia datata.

Lo studio **non sposta e non riordina** — per quello ci sono le liste. E i
`.bak` che lascia stanno nel `.gitignore`.

## Il colore dice l'appartenenza

Una tinta per **cartella di lavoro**, e ogni progetto dentro una gradazione
della stessa. Serve a riconoscere di chi è una riga a colpo d'occhio — e serve
soprattutto in Bacheca, dove c'è una mossa scritta da sola che senza colore non
dice a quale lavoro appartiene.

**La tinta si deduce dal nome della cartella.** Dodici cartelle vestite senza
aver scritto niente, nessuna scelta da rifare quando ne nasce una, nessun file
di configurazione da tenere allineato. Se una tinta non va bene si scrive
`colore:` nel `prossimi-passi.md` — dodici nomi (`rosso`, `blu`, `ottanio`…)
oppure un numero di tinta — e quella vince. Sul progetto-radice di un lavoro
vale per tutto il lavoro, perché i figli ereditano.

**Il giallo acido non è in gamma, ed è voluto**: è il colore di ciò che si
tocca. Se diventasse anche il colore di un progetto smetterebbe di dire quello
— è la stessa regola di `stile.css`, ed è la trappola «il colore dice il tipo,
e solo quello» applicata qui.

Limite noto: la tinta di una cartella che **non è anche un progetto** (come
`cantera`, che ha solo sottocartelle) oggi si può solo dedurre, non scegliere.
Per sceglierla servirebbe un `prossimi-passi.md` alla sua radice, che la
farebbe comparire fra i progetti.

## Le impostazioni stanno dietro un bottone

`per`, `entro`, `colore` e `chiudi` non sono in cima alla scheda: sono dietro
**modifica**. Sono cose che si mettono una volta; lasciate aperte, la prima
cosa che vedi aprendo un progetto sarebbero tre campi da riempire invece del
perché per cui ti piaceva — che è la ragione per cui la scheda esiste.

## Un'idea per qualcuno che non è ancora un cliente

*«Mi è venuto in mente un problema, per una certa persona, e entro una certa
data potrei prepararle qualcosa.»* Se resta in testa muore; se viene scomposto
e scritto, forse no.

**Non c'è nessuna "watchlist" a parte**, con un suo formato e una sua
schermata — ed era la prima idea, scartata il 2026-08-21. Quel pensiero **è già
un progetto**: gli manca solo la cartella. Quindi il bottone `+ un'idea per
qualcuno` crea un progetto vuoto con `per`, `entro` e il problema come perché,
e da quel momento invecchia nella bacheca come tutti gli altri — che è
esattamente la pressione che a un'idea in testa manca.

Il modulo è lo stesso da tutte e due le porte — **Scrivania → + un progetto
nuovo** e **Rubrica → + un'idea per qualcuno** — e cambia solo il titolo e il
campo su cui si apre il cursore: dalla Rubrica parti da *per chi*, dalla
Scrivania dal nome. I campi sono **come si chiama · dentro quale cartella · per
chi · perché esiste · entro quando · colore**, e tutto tranne il nome è
facoltativo. Il nome della cartella si scrive da sé e resta correggibile. Le soluzioni **non** si chiedono lì: si aggiungono dopo,
nella scheda, come belle idee. Chiederle al momento della cattura vorrebbe dire
chiedere il lavoro prima dell'intenzione, e l'idea muore al secondo campo.

**I chiusi non contano come «qui dentro hai già dichiarato qualcosa».** Se
contassero, un lavoro il cui unico progetto è chiuso sparirebbe tutto intero,
portandosi via la roba viva che non hai ancora dichiarato. Trovato provando il
seed il 2026-08-21, con `tramonto` che si portava dietro `ricerca`.

### Le prove

```bash
node prova-passi.js     # 32 prove sul formato di prossimi-passi.md
node prova-radice.js    # lo scandaglio, contro la ~/Lavori vera
```

Niente dipendenze e niente `npm test`: sono due file che si lanciano con
`node`. `prova-radice.js` monta una **maniglia finta** sul disco — parla come
una `FileSystemDirectoryHandle` ma sotto ha `fs` — e fa attraversare a
`radice.js` tutta `~/Lavori`, poi stampa l'elenco che vedresti. È l'unico modo
di provare lo scandaglio senza collegare una cartella a mano: senza, non lo
proverebbe mai nessuno.

Le due cose che tengono d'occhio, e che sono il motivo per cui il modello è
fatto così:

- **`urby` tace da 0 giorni, `food-cost-urby` da 150.** Un lavoro non deve mai
  poter mascherare un figlio sepolto: per questo la riga del lavoro misura solo
  i file della sua radice.
- **Se l'elenco dice «17 da fare», la scheda deve aprirne 17.** Un conteggio che
  non si può aprire promette una cosa che non c'è.

## La planimetria vecchia

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
