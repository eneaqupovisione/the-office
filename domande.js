/* ═══════════════════════════════════════════════════════════════════════════
   LE DOMANDE — quello che la Bacheca non ti sta facendo vedere.

   La Bacheca risponde a *cosa faccio adesso*, ed è corta di proposito: una
   mossa per progetto, e solo dei progetti toccati di recente. Quella forma la
   rende guardabile, ma le costa due cose — i progetti sepolti non ci sono, e
   le belle idee non ci sono mai state.

   Queste sono le valvole. **Non riordinano niente e non scrivono niente**: fai
   una domanda ad alta voce e l'app ti mette davanti due o tre cose. Poi la
   richiudi.

   È l'unico modo onesto di far dire all'app cos'è importante. Ordinare i passi
   da sola vorrebbe dire indovinare il futuro — quale mossa è pronta, quale
   aspetta una risposta, quale costa dieci minuti: l'app non lo sa e sbaglierebbe
   in silenzio. Ma *«questo non lo stai guardando»* è passato, e il passato si
   calcola.

   ## Due regole

   1. **«per ora no» non è «no».** Mette via una cosa per una settimana e poi la
      riporta. Cancellarla sarebbe una decisione, e una decisione si prende
      nella scheda, non di sfuggita da un elenco.
   2. **Nascondere ciò che è già in Bacheca lo decide la singola domanda**, non
      la macchina. *Cosa sto dimenticando* parla per definizione di quello che
      non stai vedendo, e ripetere il tabellone sarebbe una risposta che non
      risponde. Ma *chi sta aspettando* serve a guardare la pressione tutta
      insieme: togliere i due clienti che stanno già in Bacheca le faceva dire
      «Nessuno» mentre uno era scaduto da nove giorni, che è una bugia.

   Niente DOM qui dentro: `prova-domande.js` le fa girare da `node`.
   ═══════════════════════════════════════════════════════════════════════ */

const Domande = (() => {

  const GIORNO = 86400000;

  /* Due o tre cose. Quattro sono già un elenco, e un elenco è quello da cui
     stiamo scappando: `sol-y-mar` ha ventiquattro caselle aperte, e il motivo
     per cui non le apri è che sono ventiquattro. */
  const QUANTE = 3;

  const giorni = (p, adesso) =>
    p && p.quando ? Math.floor((adesso - p.quando) / GIORNO) : null;

  const detto = (g) =>
    g <= 0 ? 'toccato oggi' : g === 1 ? 'toccato ieri' : 'tace da ' + g + ' giorni';

  /* La chiave con cui una cosa si mette via. È il percorso più il **testo**,
     non il numero di riga: le righe si spostano sotto i piedi — Claude Code
     riscrive il file mentre l'app è aperta — e una chiave che si sposta
     rimetterebbe in mostra quello che avevi messo via.

     Il tipo davanti serve perché un'idea e una mossa possono avere le stesse
     parole: rimandare l'una non deve nascondere l'altra. */
  const chiaveDi = (tipo, p, testo) => tipo + ':' + p.percorso + '#' + testo;

  const proposta = (tipo, p, testo, sotto) =>
    ({ chiave: chiaveDi(tipo, p, testo), tipo, p, testo, sotto });

  /* ── le mosse di un progetto ──────────────────────────────────────────────
     Lo scandaglio ne consegna un elenco (`mosse`); i progetti che un
     `prossimi-passi.md` non ce l'hanno hanno solo il ripiego (`mossa`), la
     prima casella trovata in giro. */

  const mosseDi = (p) =>
    (p && p.mosse && p.mosse.length) ? p.mosse : (p && p.mossa ? [p.mossa] : []);

  /* La mossa di un progetto è **la prima che non hai messo via**. Se le hai
     messe via tutte torna `null`, e chi disegna la Bacheca sa cosa farne: il
     progetto esce dal tabellone per una settimana. Che è esattamente quello
     che gli hai detto tre volte di fare. */
  const mossaDi = (p, via) =>
    mosseDi(p).find(m => !via(chiaveDi('mossa', p, m.testo))) || null;

  /* Prima chi ha una data, dalla più vicina; poi chi non ce l'ha. */
  function perData(a, b){
    if (a && b) return a < b ? -1 : a > b ? 1 : 0;
    if (a) return -1;
    if (b) return 1;
    return 0;
  }

  /* ═══ LE PAROLE ═══════════════════════════════════════════════════════════

     Sono la parte che conta, e sono un dato: togliere una domanda è
     commentarne una voce, aggiungerne una è scrivere `trova`.

     `trova(elenco, ctx)` riceve i progetti e restituisce **tutte** le proposte
     in ordine di merito. Chi chiama toglie quelle messe via e poi taglia a
     `QUANTE`: così ogni domanda pensa solo alla sua domanda. `ctx` è
     `{ adesso, via }`.

     `nuoveSoltanto` dice se quello che è già in Bacheca va tolto. */

  const DOMANDE = [

    /* Il problema numero uno per cui questa app esiste: perdere un progetto
       sotto gli altri. La Bacheca i sepolti li nasconde di proposito — o
       smetterebbe di essere corta — e senza questa valvola non c'era nessun
       posto in cui tornassero a galla.

       I `personale` ci sono, e non contraddice la regola che non devono mai
       accusarti: un progetto che tace non ti sta dicendo niente finché **sei
       tu** a chiedere. La domanda l'hai fatta tu. */
    {
      id: 'dimentico',
      parola: 'cosa sto dimenticando?',
      vuoto: 'Niente di sepolto: quello che hai è già lì sopra.',
      nuoveSoltanto: true,
      trova: (elenco, ctx) => elenco
        .map(p => ({ p, m: mossaDi(p, ctx.via), g: giorni(p, ctx.adesso) }))
        .filter(x => x.m && x.g !== null)
        .sort((a, b) => b.g - a.g)
        .map(x => proposta('mossa', x.p, x.m.testo, x.p.nome + ' · ' + detto(x.g)))
    },

    /* Il problema numero tre: «mi ero dimenticato di aver avuto quell'idea».
       Oggi una bella idea si vede solo aprendo la scheda del progetto in cui
       l'avevi scritta — cioè esattamente il progetto che non stai aprendo.

       Prima quelle dei progetti più silenziosi: un'idea dentro una cosa che
       stai toccando questa settimana non l'hai dimenticata. */
    {
      id: 'idee',
      parola: 'che idee avevo avuto?',
      vuoto: 'Nessuna idea in giro. Si scrivono nella scheda di un progetto.',
      trova: (elenco, ctx) => elenco
        .flatMap(p => (p.idee || []).map(i => ({ p, i, g: giorni(p, ctx.adesso) || 0 })))
        .sort((a, b) => b.g - a.g)
        .map(x => proposta('idea', x.p, x.i.testo,
          'in ' + x.p.nome + (x.g >= 30 ? ' · ferma da ' + x.g + ' giorni' : '')))
    },

    /* La pressione vera, guardata in faccia tutta insieme invece che una riga
       per volta. Serve un `per`: senza un nome, nessuno aspetta — e un lavoro
       che non fa aspettare nessuno non deve comparire qui, che è la ragione
       per cui i tipi di lavoro esistono. */
    {
      /* Qui **non** si toglie quello che è in Bacheca: chi aspetta aspetta,
         che tu lo stia guardando o no. */
      id: 'aspetta',
      parola: 'chi sta aspettando?',
      vuoto: 'Nessuno, in questo momento. È una risposta buona.',
      trova: (elenco, ctx) => elenco
        .filter(p => p.per && !p.chiuso)
        .map(p => ({ p, m: mossaDi(p, ctx.via) }))
        .sort((a, b) => perData(a.p.entro, b.p.entro))
        .map(x => proposta('mossa', x.p, x.m ? x.m.testo : 'nessuna mossa scritta',
          x.p.per + (x.p.entro ? ' · entro il ' + x.p.entro : ' · nessuna data')))
    }

  ];

  /* ── fare una domanda ─────────────────────────────────────────────────────
     `ctx` è `{ adesso, via, giaVisti }` — `via(chiave)` dice se una cosa è
     messa via, `giaVisti` è l'insieme delle chiavi che stanno in Bacheca.

     `quante` è il totale prima del taglio: serve a dire «e altre quattro»
     senza mentire sul fatto che ce ne sono altre. */
  function chiedi(id, elenco, ctx){
    const d = DOMANDE.find(x => x.id === id);
    if (!d) return null;
    const giaVisti = ctx.giaVisti || new Set();
    const tutte = d.trova(elenco || [], ctx)
      .filter(x => !ctx.via(x.chiave) && !(d.nuoveSoltanto && giaVisti.has(x.chiave)));
    return { domanda: d, proposte: tutte.slice(0, QUANTE), quante: tutte.length };
  }

  return { DOMANDE, chiedi, mosseDi, mossaDi, chiaveDi, QUANTE };

})();
