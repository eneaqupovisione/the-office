/* ═══════════════════════════════════════════════════════════════════════════
   IL SEED — un disco finto, per provare l'app senza toccare `~/Lavori`.

   Si apre con `index.html?prova`. Da lì in poi The Office lavora su una
   cartella che non esiste: legge, scrive, spunta, sposta le righe sotto
   `## Fatte` — tutto vero, ma dentro `localStorage`. Nessun file del disco
   viene aperto, e non serve nessun permesso del browser.

   **Serve anche a una cosa che non è una comodità.** L'app vera poggia su
   `showDirectoryPicker`, che esiste solo nei browser Chromium: su Safari non
   c'è. In modalità prova non serve, quindi l'interfaccia si prova ovunque —
   e quando arriverà il server locale, questo file si potrà buttare.

   ## Che cosa c'è dentro, e perché proprio questo

   Il seed non è una demo carina: è un campionario dei casi che l'app deve
   saper reggere, e ce n'è uno per ognuno.

   | | |
   |---|---|
   | `bottega/sito` | qualcuno aspetta, la data è vicina, e ci sono cose già fatte |
   | `bottega/menu-digitale` | dichiarato ma senza data: nessuno aspetta, e va bene |
   | | *(le età sono scelte perché in Bacheca ne arrivino tre: una bacheca con una riga sola non fa vedere niente)* |
   | `bottega/foto` | solo `.jpg`: è materiale, **non deve comparire** fra i progetti |
   | `cartolina/demo` | **la data è passata** — l'app deve fare una domanda, non una multa |
   | `cartolina/demo/consegna.md` | caselle dentro un file con prosa e tabella: si spuntano **sul posto**, senza spostare una riga |
   | `faro` | un lavoro senza figli, mai dichiarato, fermo da quattro mesi |
   | `tramonto/app` | chiuso: fuori dall'elenco, ma non cancellato |
   | `tramonto/ricerca` | candidato con caselle sparse, dentro un lavoro che sembra morto |
   | `taccuino` | **personale**, fermo da 240 giorni: il silenzio non dev'essere rosso |
   | `_caccia.md` | tre prede e una presa — la sezione che guarda quello che non c'è ancora |
   | `_modelli/sito.md` | il modello: un progetto vuoto ben scritto, da cui partire |
   | `bottega/sito` | ci ha gia' passato il modello: in Bacheca la riga dice «La faccia · 1 di 3» |

   ## Quando non serve più

   Si cancella `seed.js` e la sua riga in `index.html`. Non c'è nient'altro
   da disfare: il resto del programma non sa che questo file esiste.
   ═══════════════════════════════════════════════════════════════════════ */

const Seed = (() => {

  const TASTO = 'ufficio.prova';
  const GIORNO = 86400000;

  const fra = (giorni) => {                       // una data, da oggi
    const d = new Date(Date.now() + giorni * GIORNO), due = (n) => String(n).padStart(2, '0');
    return d.getFullYear() + '-' + due(d.getMonth() + 1) + '-' + due(d.getDate());
  };

  /* [percorso, età in giorni, contenuto] */
  function origine(){
    return [

['_modelli/sito.md', 30,
`# sito

> a cosa serve, e qual è l'unica azione di chi arriva

## Belle idee

## Da fare

- [ ] Indagine
      - [ ] guardare cosa c'è oggi, e misurarlo
      - [ ] l'unica azione, in una frase — senza «e anche»
      - [ ] che dati girano, e in che forma — i finti sono il contratto
- [ ] Le pagine senza stile
      - [ ] i contenuti veri al loro posto, o i segnaposto dichiarati
      - [ ] si legge dall'alto in basso a CSS spento
- [ ] La faccia
      - [ ] i caratteri, visti sullo sfondo vero e non su bianco
      - [ ] sta in piedi a 375px
- [ ] I comportamenti
      - [ ] gli stati: vuoto, in caricamento, errore, troppi
      - [ ] il movimento: uno, che ti ricordi il giorno dopo
- [ ] La prova
      - [ ] telefono vero, in mano, una mano sola
      - [ ] solo tastiera: si arriva dappertutto
- [ ] La consegna
      - [ ] un indirizzo dove guardarlo, non indicizzabile
      - [ ] il contratto: i dati finti, gli stati, e cosa **non** è tuo

## Fatte
`],

['_caccia.md', 3,
`# Caccia

> chi mi interessa, prima che diventi un progetto

## Da fare

- [ ] Pasticceria Bosè — stampa il menu di Natale ogni anno e ogni anno sbaglia i prezzi
- [ ] Officina Vialli — il preventivo lo scrivono a mano su un blocchetto
- [ ] Libreria del Ponte — gli eventi li annunciano solo in vetrina

## Fatte

- [x] ${fra(-14)} · Bottega Marconi
`],

['bottega/sito/prossimi-passi.md', 2,
`---
tipo: commissione
per: Bottega Marconi
entro: ${fra(6)}
---

# sito

> far vedere il pane prima del prezzo: entri, e la prima cosa che senti è il forno

## Belle idee

- le ore di sfornata in tempo reale in cima alla pagina
- una foto sola per prodotto, grande, senza galleria

## Da fare

- [ ] La faccia
      - [x] i caratteri, visti sullo sfondo vero
      - [ ] i colori, col contrasto misurato
      - [ ] sta in piedi a 375px
- [ ] I comportamenti
      - [ ] gli stati: vuoto, in caricamento, errore
- [ ] La consegna
      - [ ] il contratto: i dati finti, gli stati, e cosa non è tuo

## Fatte

- [x] ${fra(-3)} · impaginazione a 375px
- [x] ${fra(-6)} · scelta dei caratteri
- [x] ${fra(-9)} · struttura delle pagine
- [x] ${fra(-14)} · brief con la proprietaria
`],

['bottega/sito/marca.md', 4,
`# Marca

Nessuna casella qui: serve a controllare che un \`.md\` senza cose da fare non
compaia da nessuna parte.
`],

['bottega/menu-digitale/prossimi-passi.md', 5,
`---
tipo: commissione
---

# menu-digitale

> il menu che si aggiorna dal telefono, senza chiamare nessuno

## Belle idee

- il piatto finito si spegne da solo invece di sparire

## Da fare

- [ ] decidere se serve davvero o se basta una pagina
- [ ] chiedere alla proprietaria quanto spesso cambia il menu

## Fatte
`],

['bottega/foto/pane-01.jpg',  9, 'finta immagine'],
['bottega/foto/pane-02.jpg',  9, 'finta immagine'],
['bottega/foto/vetrina.jpg', 11, 'finta immagine'],

['cartolina/demo/prossimi-passi.md', 11,
`---
tipo: sperimentale
per: Hotel Riva
entro: ${fra(-9)}
---

# demo

> mostrargli che la prenotazione può stare in tre tocchi invece che in un modulo

## Belle idee

- la disponibilità vera al posto del calendario finto
- mandargliela di lunedì mattina, non di venerdì

## Da fare

- [ ] scrivere le due righe di accompagnamento
- [ ] mandarla

## Fatte

- [x] ${fra(-42)} · schermata della prenotazione
- [x] ${fra(-45)} · finto motore di disponibilità
`],

['cartolina/demo/consegna.md', 12,
`# Consegna

È pronta quando tutte queste sono vere. **Le caselle qui dentro The Office le
spunta sul posto**: non le sposta, perché sono numerate e intrecciate a questa
prosa, e spostarle romperebbe il documento.

- [ ] **1 · Tre tocchi dalla home alla conferma.** Contati, non stimati.
- [ ] **2 · Funziona con una mano sola** tenendo il telefono in verticale.
- [x] **3 · Nessun modulo più lungo di uno schermo.**
- [ ] **4 · Si capisce senza spiegazioni** — provato su una persona vera.

| schermata | tocchi | stato |
|---|---|---|
| scelta data | 1 | fatta |
| scelta stanza | 1 | fatta |
| conferma | 1 | da rivedere |
`],

['cartolina/materiali/riva-facciata.jpg', 44, 'finta immagine'],

['faro/faro-v4.html', 120,
`<!doctype html><title>faro</title>
<p>Un prototipo mai dichiarato: nell'elenco compare il lavoro intero, e la
scheda propone di farne un progetto.</p>
`],

['faro/appunti.md', 122,
`# Appunti

- [ ] capire se la mappa serve davvero
- [ ] chiedere a qualcuno se lo userebbe
`],

['tramonto/app/prossimi-passi.md', 200,
`---
tipo: sperimentale
chiuso: ${fra(-30)}
---

# app

> era l'idea di far parlare due cose che non si parlano

## Belle idee

- l'idea buona era la seconda schermata, non la prima

## Da fare

- [ ] —

## Fatte

- [x] ${fra(-210)} · prototipo della prima schermata
`],

['taccuino/prossimi-passi.md', 240,
`---
tipo: personale
---

# taccuino

> il posto dove tengo i conti di casa, e non lo vedrà mai nessuno

## Belle idee

- la ricerca per mese

## Da fare

- [ ] sistemare l'esportazione

## Fatte
`],

['tramonto/ricerca/note.md', 65,
`# Ricerca

Cartella mai dichiarata, dentro un lavoro che sembra morto. Le sue caselle si
vedono lo stesso.

- [ ] rileggere le interviste
- [ ] capire perché la seconda schermata funzionava
- [x] raccolta dei riferimenti
`]

    ];
  }

  /* ── il magazzino ────────────────────────────────────────────────────── */

  function nuovo(){
    const d = {};
    origine().forEach(([p, eta, testo]) => { d[p] = { testo, quando: Date.now() - eta * GIORNO }; });
    return d;
  }

  function carica(){
    try{
      const grezzo = localStorage.getItem(TASTO);
      if (grezzo) return JSON.parse(grezzo);
    } catch (e){ /* illeggibile: si ricomincia */ }
    const d = nuovo();
    salva(d);
    return d;
  }

  const salva = (d) => { try { localStorage.setItem(TASTO, JSON.stringify(d)); } catch (e){} };

  function ricomincia(){
    const d = nuovo();
    salva(d);
    return d;
  }

  /* ── le maniglie finte ───────────────────────────────────────────────── */
  /* Parlano come una `FileSystemDirectoryHandle` vera — `entries()`,
     `getFileHandle`, `createWritable` — perché `radice.js` non deve sapere
     niente di tutto questo. Se lo sapesse, staremmo provando un'altra app. */

  function disco(){
    const d = carica();

    function maniglieFile(p){
      return {
        kind: 'file', name: p.split('/').pop(),
        async getFile(){
          return {
            lastModified: d[p].quando,
            async text(){ return d[p].testo; }
          };
        },
        async createWritable(){
          return {
            async write(t){ d[p].testo = t; d[p].quando = Date.now(); },
            async close(){ salva(d); }
          };
        }
      };
    }

    function maniglieCartella(prefisso, nome){
      return {
        kind: 'directory', name: nome,
        async queryPermission(){ return 'granted'; },
        async requestPermission(){ return 'granted'; },

        async *entries(){
          const visti = new Set();
          for (const p of Object.keys(d)){
            if (!p.startsWith(prefisso)) continue;
            const resto = p.slice(prefisso.length);
            const pezzo = resto.split('/')[0];
            if (visti.has(pezzo)) continue;
            visti.add(pezzo);
            yield [pezzo, resto.includes('/')
              ? maniglieCartella(prefisso + pezzo + '/', pezzo)
              : maniglieFile(p)];
          }
        },

        async getDirectoryHandle(n, o){
          const dentro = prefisso + n + '/';
          if (!Object.keys(d).some(p => p.startsWith(dentro)) && !(o && o.create))
            throw new Error('non c\'è');
          return maniglieCartella(dentro, n);
        },

        async getFileHandle(n, o){
          const p = prefisso + n;
          if (!d[p]){
            if (!o || !o.create) throw new Error('non c\'è');
            d[p] = { testo: '', quando: Date.now() };
            salva(d);
          }
          return maniglieFile(p);
        }
      };
    }

    return maniglieCartella('', 'Prova');
  }

  return { disco, ricomincia };
})();
