/* ═══════════════════════════════════════════════════════════════════════════
   L'UFFICIO — le tre sezioni, e la scheda di un progetto.

   Tre sezioni, e sono tre domande diverse. Se una schermata non risponde a una
   di queste, non ci va.

   | | |
   |---|---|
   | **Bacheca** | *cosa faccio adesso* |
   | **Scrivania** | *cosa ho in mano* |
   | **Rubrica** | *per chi lavoro* |

   ## La bacheca non è un censimento

   Mostra **una mossa per progetto**, e solo dei progetti vivi — quelli toccati
   negli ultimi giorni. Non i progetti: le mosse. E si spuntano lì, senza
   entrare da nessuna parte.

   È la risposta al «non sono stimolato a continuarlo»: `sol-y-mar` ha
   ventiquattro caselle aperte, e ventiquattro cose davanti non sono uno
   stimolo, sono il motivo per cui richiudi. Una sì.

   Che i progetti sepolti **non** compaiano qui è voluto: la bacheca deve
   restare corta o smette di essere guardata. Stanno nella Scrivania, che è
   completa, e lì il silenzio si vede.

   ## Ogni scrittura rilegge, e ogni riga dice chi è

   Il file è la verità, non lo schermo: Claude Code può cambiarlo mentre l'app
   è aperta. Quindi ogni gesto rilegge il file un istante prima, lavora sulla
   versione vera, e dichiara **quale testo si aspetta** alla riga che tocca. Se
   non combacia non fa niente e ricarica: meglio un gesto perso che una casella
   spuntata al posto sbagliato.
   ═══════════════════════════════════════════════════════════════════════ */

const Ufficio = (() => {

  const $ = (id) => document.getElementById(id);
  const GIORNO = 86400000;

  /* Quanto in là arriva «gli ultimi giorni». Due settimane: sotto, una
     settimana storta ti svuota la bacheca; sopra, ci rientra roba che stai
     già perdendo. E se in due settimane non hai toccato niente, si mostrano
     comunque i tre più recenti — una bacheca vuota al rientro dalle ferie
     sarebbe la cosa meno utile possibile. */
  const GIORNI_VIVI = 14, MINIMO_IN_BACHECA = 3;

  /* Quanto dura il tick prima che il file venga scritto e la riga sostituita.
     Mezzo secondo: sotto non lo vedi, sopra diventa un'attesa. */
  const RESPIRO = 480;

  /* ═══ L'ORDINE DELLE COSE ═════════════════════════════════════════════════

     Qui sotto c'è la **struttura dell'interfaccia, scritta come dato** invece
     che sparsa dentro il corpo delle funzioni. Spostare un blocco più in su,
     toglierne uno, cambiare cosa si legge per primo su una riga: è cambiare
     una riga qui.

     Non è ordine per il gusto dell'ordine. Serve a due cose precise:

     1. **A te**, per riorganizzare senza passare da me. Le parole che servono
        a dirmi «sposta le idee sotto le cose da fare» costano più del farlo.
     2. **A uno strumento visuale.** Finché la struttura vive dentro le
        funzioni, nessun editor può salvarti uno spostamento: non esiste un
        posto in cui scriverlo. Una lista, invece, si riscrive.

     I nomi sono le chiavi dei registri più sotto — `PEZZI` per la scheda,
     `PARTE_RIGA` e `PARTE_MOSSA` per le righe. **Un nome che non esiste viene
     saltato**, non rompe niente: si può togliere un pezzo commentandolo. */

  /* Le sezioni, nell'ordine in cui compaiono in alto.

     Le **domande** della Bacheca — «cosa sto dimenticando?» e le altre — sono
     lo stesso genere di dato, ma stanno in `domande.js`: sono logica pura, e
     tenendole qui `prova-domande.js` non potrebbe esistere, perché questo file
     tocca il `document` e da `node` non si carica. */
  const SEZIONI = [
    { id: 'bacheca',   titolo: 'Bacheca'   },
    { id: 'scrivania', titolo: 'Scrivania' },
    { id: 'rubrica',   titolo: 'Rubrica'   },
    { id: 'caccia',    titolo: 'Caccia'    }
  ];

  /* La scheda di un progetto, dall'alto in basso. */
  const SCHEDA = [
    'testa',         // il nome, e da quanto tace
    'proponi',       // «questa cartella non è ancora un progetto»
    'patto',         // per chi · entro il —, e il tasto modifica
    'impostazioni',  // il pannello, quando è aperto
    'avviso',        // chiuso, oppure la data passata
    'perche',        // la prima cosa che leggi tornando dopo mesi
    'daFare',
    'idee',          // piegate: si aprono quando le vai a cercare
    'fatte',
    'figli',         // le cartelle qui dentro, da promuovere
    'altrove'        // le caselle che vivono negli altri file
  ];

  /* Una riga della Bacheca: prima **la cosa da fare**, e il nome del lavoro
     sotto e piccolo. Il verso conta — al contrario torna a essere un elenco
     di progetti, che è esattamente quello che la Bacheca non deve essere. */
  const MOSSA       = ['spunta', 'testo', 'scadenza', 'quante', 'info', 'perOraNo', 'freccia'];
  const MOSSA_TESTO = ['cosa', 'chi'];

  /* Una riga di Scrivania e Rubrica. */
  const RIGA = ['nome', 'dentro', 'conti', 'scadenza', 'silenzio', 'freccia'];

  let lavori = null;                 // lo scandaglio
  let aperto = null;                 // { p, md, altrove }
  let sezione = localStorage.getItem('ufficio.sezione') || 'bacheca';
  let ordine  = localStorage.getItem('ufficio.ordine')  || 'scadenza';
  let mostraChiusi = false;          // i chiusi non accusano: escono dall'elenco
  let domandaAperta = null;          // quale domanda della Bacheca è aperta
  let ideeAperte = false;            // il cassetto delle belle idee, nella scheda
  let anteprimaAperta = null;        // il percorso della riga con la «i» aperta
  let ultimoScandaglio = 0;
  let modelliNoti = [];         // i `_modelli/*.md`, letti aprendo il modulo
  let modificaAperta = false;   // il pannello delle impostazioni di un progetto

  /* ── mattoncini ──────────────────────────────────────────────────────── */

  function el(tag, cls, testo){
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (testo != null) n.textContent = testo;
    return n;
  }

  function mostra(...nodi){ $('palco').replaceChildren(...nodi); }

  /* Il silenzio, detto come lo diresti a voce. Sopra i trenta giorni pesa,
     sopra i novanta grida — **tranne sui progetti personali**, dove non grida
     mai. Un progetto che fai per te non deve accusarti di niente: tacere da
     duecento giorni e' una cosa che gli e' permessa, e colorarla di rosso
     sarebbe un rimprovero per una cosa che non e' una colpa.

     Chi non ha dichiarato un tipo si comporta come prima che il tipo
     esistesse: niente cambia finche' non lo dici. */
  function tace(p){
    const quando = p && p.quando;
    if (!quando) return { testo: '—', classe: '' };
    const g = Math.floor((Date.now() - quando) / GIORNO);
    const testo = g <= 0 ? 'oggi' : g === 1 ? 'ieri' : g + ' giorni';
    if (p.tipo === 'personale') return { giorni: g, testo, classe: '' };
    return { giorni: g, testo, classe: g >= 90 ? 'troppo' : g >= 30 ? 'tanto' : '' };
  }

  /* Il markdown, tolto **solo per essere letto**. Non si usa dove il testo si
     può modificare: salvarlo riscriverebbe il file senza il grassetto che ci
     avevi messo. */
  const soloTesto = (s) => String(s || '')
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/(^|\W)[*_](\S(?:.*?\S)?)[*_](\W|$)/g, '$1$2$3')
    .replace(/`(.+?)`/g, '$1');

  function conti(p){
    const pezzi = [];
    if (p.aperte) pezzi.push(p.aperte + ' da fare');
    if (p.fatte)  pezzi.push(p.fatte + ' fatte');
    return pezzi.join(' · ');
  }

  /* ── «per ora no» ─────────────────────────────────────────────────────────
     Una cosa messa via non è una cosa cancellata: torna da sola dopo una
     settimana. È la differenza fra rimandare e decidere — e decidere si fa
     nella scheda, dove c'è il × , non di sfuggita da un elenco.

     Vive in `localStorage` e **non tocca il file**, ed è voluto: un `- [ ]`
     nel `prossimi-passi.md` deve continuare a voler dire una cosa sola. Se
     «rimandato» diventasse uno stato scritto lì dentro, il file smetterebbe di
     essere leggibile da Claude Code senza sapere le regole di quest'app.

     Il prezzo è che la memoria sta nel browser: cambi computer e le cose
     rimandate riaffiorano. Per una settimana di rinvii è un prezzo giusto. */

  const SETTIMANA = 7 * GIORNO;
  const CHIAVE_VIA = 'ufficio.messeVia';

  /* Legge, e già che c'è butta via le scadute: così l'elenco non cresce per
     sempre e non serve nessuna pulizia da nessun'altra parte. */
  function messeVia(){
    let m = {};
    try { m = JSON.parse(localStorage.getItem(CHIAVE_VIA) || '{}') || {}; }
    catch (e){ m = {}; }
    const ora = Date.now();
    let cambiato = false;
    Object.keys(m).forEach(k => { if (!(m[k] > ora)){ delete m[k]; cambiato = true; } });
    if (cambiato) localStorage.setItem(CHIAVE_VIA, JSON.stringify(m));
    return m;
  }

  function mettiVia(chiave){
    const m = messeVia();
    m[chiave] = Date.now() + SETTIMANA;
    localStorage.setItem(CHIAVE_VIA, JSON.stringify(m));
  }

  const viaPerOra = (chiave) => Object.prototype.hasOwnProperty.call(messeVia(), chiave);

  /* ── i colori ─────────────────────────────────────────────────────────────
     Una tinta per cartella di lavoro, e ogni progetto dentro una **gradazione
     della stessa tinta**. Serve a riconoscere l'appartenenza a colpo d'occhio,
     e serve soprattutto in Bacheca: lì c'è una mossa scritta da sola, e senza
     colore non dice di chi è.

     La tinta si **deduce dal nome della cartella**. Dodici cartelle vestite
     senza aver scritto niente, nessuna scelta da rifare quando ne nasce una, e
     nessun file di configurazione da tenere allineato. Se una tinta non va
     bene si scrive `colore:` nel `prossimi-passi.md`, e quella vince — sul
     progetto-radice di un lavoro vale per tutto il lavoro, perché i figli
     ereditano.

     **Il giallo acido non è in gamma, ed è voluto**: è il colore di ciò che si
     tocca. Se diventasse anche il colore di un progetto, smetterebbe di dire
     quello — ed è la stessa regola che c'era in `stile.css`. */

  const TINTE = [
    ['rosso', 6], ['arancio', 24], ['terra', 38], ['salvia', 104],
    ['verde', 146], ['acqua', 170], ['ottanio', 190], ['blu', 214],
    ['indaco', 240], ['viola', 268], ['prugna', 296], ['rosa', 330]
  ];

  const scuro = () => window.matchMedia('(prefers-color-scheme: dark)').matches;

  /* Una firma stabile del nome: la stessa cartella prende sempre la stessa
     tinta, oggi e fra sei mesi, senza che sia scritto da nessuna parte. */
  function impronta(s){
    let n = 0;
    for (let i = 0; i < s.length; i++) n = (n * 31 + s.charCodeAt(i)) >>> 0;
    return n;
  }

  function tintaDetta(valore){
    const v = String(valore || '').trim().toLowerCase();
    if (!v) return null;
    const t = TINTE.find(([nome]) => nome === v);
    if (t) return t[1];
    const n = parseInt(v, 10);
    return isNaN(n) ? null : ((n % 360) + 360) % 360;
  }

  /* La tinta di un progetto: la sua, se l'ha dichiarata; se no quella della
     sua cartella; se no quella dedotta dal nome della cartella. */
  function tintaDi(p){
    const sua = tintaDetta(p.colore);
    if (sua !== null) return sua;
    const nomeCartella = p.dentro || p.nome;
    const l = lavoroDi(nomeCartella);
    const dellaCartella = l ? tintaDetta(l.colore) : null;
    if (dellaCartella !== null) return dellaCartella;
    return TINTE[impronta(nomeCartella) % TINTE.length][1];
  }

  /* La gradazione: dentro una cartella, ogni progetto si sposta un gradino in
     chiarezza. Restano parenti a vista, ma non si confondono fra loro. */
  function coloreDi(p){
    const h = tintaDi(p);
    const l = lavoroDi(p.dentro || p.nome);
    const fratelli = l ? l.progetti.filter(x => x.tipo !== 'materiale') : [];
    const i = Math.max(0, fratelli.findIndex(x => x.nome === p.nome && x.dentro === p.dentro));
    const passo = (i % 4) * (scuro() ? 7 : 8);
    return scuro()
      ? 'hsl(' + h + ' 48% ' + (58 + passo) + '%)'
      : 'hsl(' + h + ' 54% ' + (46 - passo) + '%)';
  }

  const tinteggia = (nodo, p) => { nodo.style.setProperty('--tinta', coloreDi(p)); return nodo; };

  /* La tavolozza: dodici pastiglie più «come la cartella», che è il valore di
     partenza e si sceglie togliendo, non aggiungendo. */
  function tavolozza(scelto, p, salva){
    const t = el('div', 'tavolozza');
    const chiave = String(scelto || '').trim().toLowerCase();

    const auto = el('button', 'pastiglia auto' + (chiave ? '' : ' scelta'));
    auto.type = 'button';
    auto.title = 'come la cartella';
    auto.style.setProperty('--tinta', coloreDi(Object.assign({}, p, { colore: '' })));
    auto.addEventListener('click', () => salva(''));
    t.append(auto);

    TINTE.forEach(([nome, h]) => {
      const b = el('button', 'pastiglia' + (chiave === nome ? ' scelta' : ''));
      b.type = 'button';
      b.title = nome;
      b.style.setProperty('--tinta', scuro() ? 'hsl(' + h + ' 48% 62%)' : 'hsl(' + h + ' 54% 46%)');
      b.addEventListener('click', () => salva(nome));
      t.append(b);
    });
    return t;
  }

  /* ── i tre tipi ───────────────────────────────────────────────────────────
     Ognuno chiede all'app una cosa diversa, ed e' per questo che esistono:
     la commissione ha gia' la sua pressione e basta mostrarla, il personale
     non deve accusarti mai, lo sperimentale e' l'unico che va risvegliato —
     nessuno lo aspetta, ma ci tieni, ed e' esattamente il caso per cui questa
     app e' stata scritta. */

  const DETTO = {
    commissione:  { corto: 'commissione',  lungo: 'qualcuno l\'ha chiesto, e aspetta' },
    personale:    { corto: 'personale',    lungo: 'lo usi tu, e nessuno aspettera\' mai' },
    sperimentale: { corto: 'sperimentale', lungo: 'nessuno l\'ha chiesto — ma se funziona ha un pubblico' }
  };

  /* La stessa domanda cambia parole col tipo. A una commissione «per chi»
     significa chi paga; a uno sperimentale significa chi lo userebbe **se**
     funzionasse — ed e' quella la domanda che trasforma un desiderio in una
     cosa che pesa. */
  const chiedePerChi = (tipo) =>
    tipo === 'sperimentale' ? 'per chi lo faresti, se funzionasse'
    : tipo === 'personale'  ? 'per chi (sei tu, di solito)'
    : 'per chi';

  function selettoreTipo(scelto, salva){
    const t = el('div', 'tipi');
    Passi.TIPI.forEach(nome => {
      const b = el('button', 'min' + (scelto === nome ? ' scelto' : ''), DETTO[nome].corto);
      b.type = 'button';
      b.title = DETTO[nome].lungo;
      b.addEventListener('click', () => salva(scelto === nome ? '' : nome));
      t.append(b);
    });
    return t;
  }

  /* I clienti già scritti da qualche parte: si suggeriscono invece di
     ricordarseli, e così «Hotel Riva» non diventa anche «hotel riva». */
  const clientiNoti = () => [...new Set((lavori || [])
    .flatMap(l => l.progetti).map(p => (p.per || '').trim()).filter(Boolean))].sort();

  function elencoClienti(){
    const d = document.createElement('datalist');
    d.id = 'clienti-noti';
    clientiNoti().forEach(n => { const o = document.createElement('option'); o.value = n; d.append(o); });
    return d;
  }

  /* Sulle schermate di primo avvio, una via d'uscita verso il disco finto.
     Serve al sito pubblicato: chi lo apre da un altro computer non ha nessuna
     `~/Lavori` da collegare, e senza questa riga vedrebbe solo una porta
     chiusa. Non compare quando sei gia' in prova. */
  function conProva(d){
    if (inProva()) return d;
    const a = el('a', 'sottile', 'oppure guardala con dei dati finti');
    a.href = '?prova';
    d.append(a);
    return d;
  }

  function dice(titolo, testo, etichettaBottone, azione, male){
    const d = el('div', 'dice' + (male ? ' male' : ''));
    d.append(el('h2', null, titolo), el('p', null, testo));
    if (etichettaBottone){
      const b = el('button', 'grosso', etichettaBottone);
      b.addEventListener('click', azione);
      d.append(b);
    }
    return d;
  }

  /* ── la modalità prova ───────────────────────────────────────────────────
     `index.html?prova` monta il disco finto di `seed.js` al posto della
     cartella vera: si prova tutto senza rischiare un file, e **anche su
     Safari**, dove `showDirectoryPicker` non esiste. Cancellato `seed.js`,
     `inProva` resta falso da solo. */
  const inProva = () =>
    /(^|[?&])prova(&|=|$)/.test(location.search) && typeof Seed !== 'undefined';

  /* ── l'avvio ─────────────────────────────────────────────────────────── */

  /* Quali file non sono arrivati. Serve contro un guaio che si vede male: se
     il browser si tiene in cache un `index.html` vecchio, quella pagina
     carica un elenco di script vecchio, e un file nuovo — `domande.js`,
     quando è nato — semplicemente non c'è. L'app allora esplode dentro la
     prima funzione che lo usa, e da fuori sembra soltanto che **cambiare
     sezione non faccia niente**: nessun messaggio, nessun indizio.

     Un `typeof` su un nome mai dichiarato non è un errore, e `Passi` e
     compagnia sono `const` di primo livello: non stanno su `window`, quindi
     `window.Passi` sarebbe `undefined` anche quando il file c'è. */
  function mancano(){
    const fuori = [];
    if (typeof Passi   === 'undefined') fuori.push('passi.js');
    if (typeof Radice  === 'undefined') fuori.push('radice.js');
    if (typeof Domande === 'undefined') fuori.push('domande.js');
    return fuori;
  }

  /* Ricarica saltando la cache, tenendosi `?prova` e tutto il resto. */
  function ricarica(){
    const q = new URLSearchParams(location.search);
    q.set('_', String(Date.now()));
    location.replace(location.pathname + '?' + q.toString());
  }

  async function avvia(){
    const senza = mancano();
    if (senza.length){
      const p = el('div', 'scheda');
      p.append(el('h1', null, 'Manca un pezzo'));
      p.append(el('p', 'occhiello',
        'Non sono arrivati: ' + senza.join(', ') + '. Quasi sempre vuol dire che il ' +
        'browser si è tenuto una versione vecchia di questa pagina.'));
      const b = el('button', 'min', 'ricarica saltando la cache');
      b.addEventListener('click', ricarica);
      p.append(b);
      mostra(p);
      return;
    }

    /* Il menu lo costruisce `SEZIONI`, non l'HTML: aggiungerne una, toglierla
       o cambiarle nome e' una riga in cima al file. */
    $('sezioni').replaceChildren(...SEZIONI.map(({ id, titolo }) => {
      const b = el('button', null, titolo);
      b.dataset.sezione = id;
      b.addEventListener('click', () => {
        sezione = id;
        localStorage.setItem('ufficio.sezione', id);
        aperto = null;
        disegna();
      });
      return b;
    }));

    /* Niente bottone «riscandaglia»: l'app si rilegge da sola quando torni
       sulla finestra, che è il momento in cui potresti aver cambiato i file da
       Claude Code. Solo se non stai dentro una scheda — rifare il giro mentre
       scrivi ti cancellerebbe il campo da sotto le dita. */
    window.addEventListener('focus', async () => {
      if (aperto || !lavori) return;
      if (Date.now() - ultimoScandaglio < 3000) return;
      await scandaglia();
    });

    if (inProva()){
      Radice.attacca(Seed.disco());
      await scandaglia();
      return;
    }

    if (!Radice.possibile()){
      mostra(conProva(dice(
        'Serve Chrome o Edge',
        'Per leggere e scrivere dentro ~/Lavori serve la funzione «cartella collegata», '
        + 'che esiste solo nei browser Chromium e solo da https o localhost.',
        null, null, true)));
      return;
    }

    if (await Radice.riprendi()){ await scandaglia(); return; }

    /* Distinguere «non hai mai collegato» da «il permesso è scaduto» conta:
       nel secondo caso i progetti ci sono tutti e non va detto il contrario. */
    if (Radice.collegata()){
      mostra(dice(
        'Il permesso sulla cartella è scaduto',
        'Il browser lo revoca da solo dopo un po\' che l\'app non si apre. I progetti sono tutti lì: '
        + 'serve solo rinnovarlo, e ci vuole un tocco perché il browser non lo concede senza.',
        'Rinnova il permesso',
        async () => { if (await Radice.permesso(true)) await scandaglia(); }));
      return;
    }

    mostra(conProva(dice(
      'Collega ~/Lavori',
      'The Office non ha dati suoi: legge le cartelle che hai già. Collega ~/Lavori una volta '
      + 'e da lì in poi si ricorda.',
      'Collega la cartella',
      async () => { if (await Radice.collega()) await scandaglia(); })));
  }

  /* ── lo scandaglio ───────────────────────────────────────────────────── */

  async function scandaglia(){
    const attesa = el('p', 'attesa', 'guardo dentro le cartelle…');
    mostra(attesa);

    lavori = await Radice.scandaglia((fatti, totali, cosa) => {
      attesa.textContent = cosa ? 'guardo dentro ' + cosa + '…  (' + (fatti + 1) + ' di ' + totali + ')' : '';
    });
    ultimoScandaglio = Date.now();

    if (!lavori){
      mostra(dice(
        'Il permesso sulla cartella è scaduto',
        'I progetti sono tutti dove li hai lasciati — l\'app non li vede più, ed è una cosa diversa.',
        'Rinnova il permesso',
        async () => { if (await Radice.permesso(true)) await scandaglia(); }, true));
      return;
    }

    $('dove').textContent = inProva() ? '⚗︎ prova' : '~/' + Radice.nome();
    $('sezioni').hidden = false;
    disegna();
  }

  /* ── che cosa esiste ─────────────────────────────────────────────────── */

  /* Finché dentro una cartella di lavoro non hai dichiarato nemmeno un
     progetto, vale la cartella intera: meglio una riga onesta che dieci
     indovinate. I **chiusi** non contano come «qui hai già dichiarato
     qualcosa», o un lavoro il cui unico progetto è chiuso sparirebbe tutto,
     portandosi via la roba viva che non hai ancora dichiarato. */
  function progetti(){
    const fuori = [];
    (lavori || []).forEach(l => {
      const vivi = l.progetti.filter(p => p.dichiarato && !p.chiuso);
      if (vivi.length) fuori.push(...vivi);
      else fuori.push(Object.assign({}, l, { dentro: null, soloRadice: false }));
      if (mostraChiusi) fuori.push(...l.progetti.filter(p => p.dichiarato && p.chiuso));
    });
    return fuori;
  }

  const chiusi = () => (lavori || []).flatMap(l => l.progetti.filter(p => p.chiuso));
  const lavoroDi = (nome) => (lavori || []).find(l => l.nome === nome) || null;

  const perSilenzio = (a, b) => (b.quando || 0) - (a.quando || 0);

  /* Chi ha una data viene prima, e la più vicina in cima — quindi le scadute
     stanno più in alto di tutte, che è il posto giusto per una domanda a cui
     non hai ancora risposto. Chi non ha data cade in fondo, per silenzio. */
  function perScadenza(a, b){
    const x = a.entro || '', y = b.entro || '';
    if (x && y) return x < y ? -1 : x > y ? 1 : 0;
    if (x) return -1;
    if (y) return 1;
    return perSilenzio(a, b);
  }

  function disegna(){
    $('sezioni').querySelectorAll('button').forEach(b =>
      b.setAttribute('aria-current', String(b.dataset.sezione === sezione)));
    const viste = { bacheca, scrivania, rubrica, caccia };
    (viste[sezione] || bacheca)();
  }

  /* La riga di servizio in fondo, solo in prova. Non sta nella testata perché
     non è una cosa dell'app: è un attrezzo della prova. */
  function codaProva(fuori){
    if (!inProva()) return;
    const b = el('button', 'sottile', 'ricomincia la prova da capo');
    b.addEventListener('click', async () => {
      Seed.ricomincia();
      Radice.attacca(Seed.disco());
      await scandaglia();
    });
    fuori.push(b);
  }

  /* ═══ BACHECA — cosa faccio adesso ═══════════════════════════════════════ */

  function bacheca(){
    aperto = null;
    const fuori = [];

    /* Ogni progetto porta in Bacheca **la prima mossa che non hai messo via**.
       Se le ha messe via tutte esce dal tabellone finché non tornano: gliel'hai
       detto tre volte. Chi una mossa non ce l'ha proprio resta, perché la sua
       riga dice «aprilo e scrivine una», che è una cosa da fare. */
    const conQuando = progetti().filter(p => p.quando);
    const tutti = conQuando.map(p => {
      const tutte = Domande.mosseDi(p);
      const scelta = Domande.mossaDi(p, viaPerOra);
      if (!scelta && tutte.length) return null;
      /* Quale delle sue mosse è quella che finisce in Bacheca: rimandandone
         una, la riga dice «2 di 5» invece di «1 di 5». È vero, ed è utile. */
      const i = scelta ? tutte.findIndex(m => m.testo === scelta.testo) : -1;
      return Object.assign({}, p, { mossa: scelta, indiceMossa: i, quanteMosse: tutte.length });
    }).filter(Boolean);

    const vivi = tutti.filter(p => tace(p).giorni <= GIORNI_VIVI);
    const scelti = (vivi.length ? vivi : tutti.slice().sort(perSilenzio).slice(0, MINIMO_IN_BACHECA))
      .slice().sort(perSilenzio);

    if (!scelti.length){
      fuori.push(el('p', 'vuoto', conQuando.length
        ? 'Per adesso hai rimandato tutto. Le cose messe via tornano da sole entro una settimana.'
        : 'Non c\'è ancora niente. I progetti si dichiarano dalla Scrivania.'));
      fileDomande(fuori, scelti);
      codaProva(fuori);
      mostra(...fuori);
      return;
    }

    fuori.push(el('p', 'occhiello',
      vivi.length ? 'Una mossa per progetto, di quelli toccati negli ultimi ' + GIORNI_VIVI + ' giorni.'
                  : 'Negli ultimi ' + GIORNI_VIVI + ' giorni non hai toccato niente. Questi sono gli ultimi che hai lasciato.'));

    scelti.forEach(p => {
      const r = rigaMossa(p);
      fuori.push(r);
      if (anteprimaAperta === p.percorso){
        r.classList.add('conAnteprima');   // perde il fondo: i due pezzi sono uno
        fuori.push(anteprima(p));
      }
    });
    fileDomande(fuori, scelti);
    codaProva(fuori);
    mostra(...fuori);
  }

  /* ── l'anteprima di un progetto ───────────────────────────────────────────
     Quello che la scheda direbbe, detto sotto la riga. Non è una scorciatoia
     per aprire il progetto — per quello c'è la freccia, ed è un clic: serve a
     **decidere se aprirlo**, che è una domanda diversa e più frequente.

     Una mossa scritta stringata tre settimane fa spesso non si capisce da sola;
     il perché del progetto la rimette in piedi senza farti cambiare schermata e
     perdere il posto in cui eri. */

  function anteprima(p){
    const box = tinteggia(el('div', 'anteprima'), p);

    if (p.perche) box.append(el('blockquote', 'perche', soloTesto(p.perche)));

    /* Una riga sola di fatti, e ci torna il silenzio: qui significa qualcosa,
       perché lo stai chiedendo tu di un progetto preciso. */
    const fatti = [];
    if (p.tipo) fatti.push(p.tipo);
    if (p.per)  fatti.push('per ' + p.per);
    const s = Passi.scadenza(p.entro);
    if (s) fatti.push(s.testo);
    const t = tace(p);
    if (t.giorni != null) fatti.push('tace da ' + t.testo);
    const c = conti(p);
    if (c) fatti.push(c);
    if (fatti.length) box.append(el('p', 'fatti', fatti.join(' · ')));

    if (p.idee && p.idee.length){
      const d = el('div', 'ideine');
      d.append(el('h3', null, p.idee.length === 1 ? 'una bella idea' : p.idee.length + ' belle idee'));
      p.idee.forEach(i => d.append(el('p', null, soloTesto(i.testo))));
      box.append(d);
    }

    const b = el('button', 'min', 'apri il progetto');
    b.addEventListener('click', () => apri(p));
    box.append(b);

    return box;
  }

  /* ── le domande ───────────────────────────────────────────────────────────
     Stanno **sotto** la Bacheca, e non è indifferente: prima leggi cosa fare,
     poi semmai chiedi. Sopra sarebbero quattro bottoni davanti a una lista di
     tre righe, e la sezione smetterebbe di rispondere alla sua domanda.

     E non stanno nella testata, dove il `CLAUDE.md` vieta i bottoni di
     servizio — ma la ragione vera è un'altra: questi non sono servizio. Sono
     roba della Bacheca, e quando sei in Scrivania non vogliono dire niente. */

  function fileDomande(fuori, suLaBacheca){
    const fila = el('div', 'domande');
    Domande.DOMANDE.forEach(d => {
      const b = el('button', 'parola', d.parola);
      b.setAttribute('aria-pressed', String(domandaAperta === d.id));
      b.addEventListener('click', () => {
        domandaAperta = (domandaAperta === d.id) ? null : d.id;   // ricliccare richiude
        bacheca();
      });
      fila.append(b);
    });
    fuori.push(fila);
    if (domandaAperta) fuori.push(risposta(domandaAperta, suLaBacheca));
  }

  /* Una risposta mostra ciò che **non** stai già vedendo: le chiavi di quello
     che è in Bacheca escono, o la risposta ripeterebbe la domanda. */
  function risposta(id, suLaBacheca){
    const giaVisti = new Set((suLaBacheca || [])
      .filter(p => p.mossa)
      .map(p => Domande.chiaveDi('mossa', p, p.mossa.testo)));

    const r = Domande.chiedi(id, progetti(), { adesso: Date.now(), via: viaPerOra, giaVisti });
    const cassetto = el('div', 'risposta');
    if (!r) return cassetto;

    if (!r.proposte.length){
      cassetto.append(el('p', 'vuoto', r.domanda.vuoto));
      return cassetto;
    }

    r.proposte.forEach(x => cassetto.append(rigaProposta(x)));

    /* Quante ne restano fuori. Dirlo è meglio che tacerlo: un elenco che
       taglia in silenzio ti fa credere di aver visto tutto. */
    const altre = r.quante - r.proposte.length;
    if (altre > 0)
      cassetto.append(el('p', 'altre', altre === 1 ? 'e un\'altra' : 'e altre ' + altre));

    return cassetto;
  }

  function rigaProposta(x){
    const r = tinteggia(el('div', 'proposta' + (x.tipo === 'idea' ? ' daIdea' : '')), x.p);

    const mezzo = el('div', 'mezzo');
    mezzo.append(el('div', 'cosa', soloTesto(x.testo)));
    if (x.sotto) mezzo.append(el('div', 'chi', x.sotto));
    r.append(mezzo);

    const poi = el('button', 'poi', 'per ora no');
    poi.title = 'la mette da parte per una settimana';
    poi.addEventListener('click', (e) => { e.stopPropagation(); mettiVia(x.chiave); bacheca(); });
    r.append(poi, el('span', 'apri', '›'));

    r.addEventListener('click', (e) => { if (e.target.tagName !== 'BUTTON') apri(x.p); });
    r.tabIndex = 0;
    r.addEventListener('keydown', (e) => { if (e.key === 'Enter'){ e.preventDefault(); apri(x.p); } });
    return r;
  }

  /* Una mossa, e sotto il progetto da cui viene. Il verso conta: quello che
     leggi per primo è la cosa da fare, non il nome del lavoro. */
  /* ── le parti di una riga della Bacheca ──────────────────────────────── */

  const PARTE_MOSSA = {

    /* La casella, e **solo** la casella, spunta una mossa: il clic sulla riga
       apre la scheda e non tocca niente. Ma il quadratino nudo è vent'anni di
       pixel: sta dentro un'etichetta che gli fa da bersaglio, così ci prendi
       senza mirare e senza che il gesto diventi «apri il progetto» per un
       millimetro di scarto.

       E il segno si vede **prima** della scrittura. Prima faceva il contrario —
       scriveva il file e rifaceva subito lo scandaglio, che ridisegnava la
       riga: la spunta c'era per un fotogramma e poi la sostituiva la mossa
       dopo. Un gesto che non lascia traccia non sembra un gesto riuscito,
       sembra un clic andato a vuoto. Ora la scrittura aspetta il tick. */
    spunta: (p) => {
      if (!p.mossa) return null;
      const etichetta = el('label', 'casella');
      const c = document.createElement('input');
      c.type = 'checkbox';
      c.title = 'fatta';
      etichetta.append(c);
      etichetta.addEventListener('click', (e) => e.stopPropagation());

      c.addEventListener('change', async () => {
        const r = etichetta.closest('.mossa');
        if (r){
          r.classList.add('fatta');
          r.querySelectorAll('input, button').forEach(x => { x.disabled = true; });
        }
        await new Promise(f => setTimeout(f, RESPIRO));

        const dove = p.percorso + '/' + p.mossa.file;
        const { testo, riga, sua } = p.mossa;
        try {
          const prima = (await Radice.leggi(dove)) || '';
          const dopo = sua ? Passi.spunta(prima, riga, testo) : Passi.spuntaSulPosto(prima, riga, true, testo);
          if (dopo !== prima) await Radice.scrivi(dove, dopo);
        } catch (e){
          /* Non è andata: la riga torna com'era, invece di restare barrata a
             dire una cosa che sul disco non è successa. */
          if (r){
            r.classList.remove('fatta');
            r.querySelectorAll('input, button').forEach(x => { x.disabled = false; });
          }
          c.checked = false;
          return;
        }
        await scandaglia();          // la mossa dopo prende il suo posto
      });
      return etichetta;
    },

    /* «1 di 5» — a che punto sei dentro quel progetto. Sostituisce il silenzio,
       che in Bacheca non diceva niente: qui dentro ci sono per costruzione solo
       progetti toccati negli ultimi quattordici giorni, quindi quel numero
       variava poco e non cambiava nessuna decisione. Quanto tace un progetto è
       una cosa da Scrivania, e ora sta anche sotto la «i».

       Con una mossa sola non compare: «1 di 1» è rumore. */
    quante: (p) => {
      /* Se il passo ha delle cose fini sotto, il conto è il **loro**: dice
         quanto sei dentro a questo passo, che è il numero che si muove ogni
         giorno. Se non ne ha, resta quello di prima — quale passo su quanti. */
      if (p.mossa && p.mossa.figli)
        return el('span', 'quante', p.mossa.figli.fatti + ' di ' + p.mossa.figli.totali);
      if (!p.mossa || !(p.quanteMosse > 1)) return null;
      return el('span', 'quante', (p.indiceMossa + 1) + ' di ' + p.quanteMosse);
    },

    /* La «i»: apre sotto la riga un'anteprima della scheda, senza cambiare
       schermata. La freccia porta al progetto; questa ti fa decidere se
       andarci. */
    info: (p) => {
      const b = el('button', 'info', 'i');
      const aperta = anteprimaAperta === p.percorso;
      b.title = aperta ? 'chiudi i dettagli' : 'dettagli del progetto';
      b.setAttribute('aria-label', b.title);
      b.setAttribute('aria-expanded', String(aperta));
      b.addEventListener('click', (e) => {
        e.stopPropagation();
        anteprimaAperta = aperta ? null : p.percorso;
        bacheca();
      });
      return b;
    },

    testo: (p) => {
      const mezzo = el('div', 'mezzo');
      const parti = {
        cosa: () => el('div', 'cosa', p.mossa ? soloTesto(p.mossa.testo) : 'nessuna mossa scritta'),
        chi: () => {
          const s = el('div', 'chi');
          s.append(el('span', 'nome', p.nome));
          if (p.dentro) s.append(el('span', null, ' · in ' + p.dentro));
          if (!p.mossa) s.append(el('span', null, ' · aprilo e scrivine una'));
          return s;
        }
      };
      MOSSA_TESTO.forEach(n => { if (parti[n]) mezzo.append(parti[n]()); });
      return mezzo;
    },

    scadenza: (p) => {
      if (p.chiuso) return null;
      const s = Passi.scadenza(p.entro);
      return s ? el('span', 'scad' + (s.scaduta ? ' scaduta' : ''), s.testo) : null;
    },

    silenzio: (p) => {
      const t = tace(p);
      return el('span', 'tace ' + t.classe, t.testo);
    },

    /* La valvola che sblocca il tabellone. Senza, una mossa che non fai — ma
       che non vuoi nemmeno togliere — tiene il suo progetto fermo in cima per
       tre settimane, e la Bacheca diventa una cosa che smetti di guardare.
       Con questo, la mossa dopo dello stesso progetto prende il suo posto. */
    perOraNo: (p) => {
      if (!p.mossa) return null;
      /* Un simbolo, non tre parole: «per ora no» scritto per esteso pesava
         quanto la mossa e su ogni riga chiedeva di essere letto. Le doppie
         parentesi angolari dicono *avanti, questa la salto* — e la frase intera
         resta nel `title` e nell'etichetta per chi non vede il simbolo. */
      const b = el('button', 'poi', '\u00BB');
      b.title = 'per ora no — la mette da parte per una settimana';
      b.setAttribute('aria-label', b.title);
      b.addEventListener('click', (e) => {
        e.stopPropagation();
        mettiVia(Domande.chiaveDi('mossa', p, p.mossa.testo));
        bacheca();
      });
      return b;
    },

    freccia: () => el('span', 'apri', '›')
  };

  function rigaMossa(p){
    const r = tinteggia(el('div', 'mossa'), p);
    MOSSA.forEach(n => {
      const fai = PARTE_MOSSA[n];
      if (!fai) return;
      const nodo = fai(p);
      if (nodo) r.append(nodo);
    });

    r.addEventListener('click', (e) => {
      if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'BUTTON') apri(p);
    });
    r.tabIndex = 0;
    r.addEventListener('keydown', (e) => { if (e.key === 'Enter'){ e.preventDefault(); apri(p); } });
    return r;
  }

  /* ═══ SCRIVANIA — cosa ho in mano ════════════════════════════════════════ */

  function scrivania(){
    aperto = null;
    const fuori = [];

    const scelta = el('div', 'scelta');
    [['scadenza', 'per scadenza'], ['appartenenza', 'per appartenenza']].forEach(([id, etichetta]) => {
      const b = el('button', 'min', etichetta);
      b.setAttribute('aria-pressed', String(ordine === id));
      b.addEventListener('click', () => {
        ordine = id;
        localStorage.setItem('ufficio.ordine', id);
        scrivania();
      });
      scelta.append(b);
    });
    fuori.push(scelta);

    const tutti = progetti();
    if (!tutti.length){
      fuori.push(el('p', 'vuoto', 'Dentro ~/' + Radice.nome() + ' non c\'è nessuna cartella di lavoro.'));
      mostra(...fuori);
      return;
    }

    if (ordine === 'scadenza'){
      /* Due mucchi, perché sono due cose diverse: quello che qualcuno aspetta,
         e quello che nessuno aspetta. Il secondo non è in ritardo — non ha una
         data, e non deve sembrare in colpa per questo. */
      /* Tre mucchi, e sono i tre tipi visti dal verso della pressione.
         «Nessuno aspetterà» non è una mancanza: è una scelta, e va detta con
         parole che non suonino come un rimprovero. */
      const conData = tutti.filter(p => p.entro).sort(perScadenza);
      const mai     = tutti.filter(p => !p.entro && p.tipo === 'personale').sort(perSilenzio);
      const ancora  = tutti.filter(p => !p.entro && p.tipo !== 'personale').sort(perSilenzio);

      const g1 = el('div', 'gruppo');
      g1.append(el('h2', null, 'qualcuno aspetta'));
      if (conData.length) conData.forEach(p => g1.append(riga(p, true)));
      else g1.append(el('p', 'vuoto', 'Nessun progetto ha una data. È l\'unica cosa che fa pressione: aprine uno e mettigliela.'));
      fuori.push(g1);

      if (ancora.length){
        const g2 = el('div', 'gruppo');
        g2.append(el('h2', null, 'nessuno aspetta ancora'));
        ancora.forEach(p => g2.append(riga(p, true)));
        fuori.push(g2);
      }

      if (mai.length){
        const g3 = el('div', 'gruppo');
        g3.append(el('h2', null, 'nessuno aspetterà, e va bene'));
        mai.forEach(p => g3.append(riga(p, true)));
        fuori.push(g3);
      }
    } else {
      const dentroA = new Map();
      tutti.forEach(p => {
        const chiave = p.dentro || p.nome;
        if (!dentroA.has(chiave)) dentroA.set(chiave, []);
        dentroA.get(chiave).push(p);
      });

      [...dentroA.entries()]
        .sort((a, b) => Math.max(...b[1].map(p => p.quando || 0)) - Math.max(...a[1].map(p => p.quando || 0)))
        .forEach(([nomeLavoro, dentro]) => {
          const g = el('div', 'gruppo');
          const h = el('h2');
          const b = el('button', 'titolo', nomeLavoro);
          b.title = 'apri la cartella di lavoro';
          b.addEventListener('click', () => apri(lavoroDi(nomeLavoro)));
          h.append(tinteggia(el('span', 'pallino'), dentro[0]), b);
          g.append(h);
          dentro.slice().sort(perSilenzio).forEach(p => g.append(riga(p, false)));
          fuori.push(g);
        });
    }

    /* I chiusi non spariscono e non si cancellano: stanno dietro una riga, che
       è la differenza fra «non mi accusa più» e «non è mai esistito». */
    const c = chiusi();
    if (c.length){
      const quanti = c.length === 1 ? 'il progetto chiuso' : 'i ' + c.length + ' progetti chiusi';
      const b = el('button', 'sottile', (mostraChiusi ? 'nascondi ' : 'mostra ') + quanti);
      b.addEventListener('click', () => { mostraChiusi = !mostraChiusi; scrivania(); });
      fuori.push(b);
    }

    const piu = el('button', 'aggiungi-riga', '+  un progetto nuovo');
    piu.addEventListener('click', () => nuovoProgetto('scrivania'));
    fuori.push(piu);

    codaProva(fuori);
    mostra(...fuori);
  }

  /* ── le parti di una riga di Scrivania e Rubrica ─────────────────────── */

  const PARTE_RIGA = {
    nome: (p) => el('span', 'nome', p.nome),

    dentro: (p, conNomeDelLavoro) => {
      if (!conNomeDelLavoro || !p.dentro) return null;
      const d = el('span', 'dentro tocca', 'in ' + p.dentro);
      d.title = 'apri la cartella di lavoro';
      d.addEventListener('click', (e) => { e.stopPropagation(); apri(lavoroDi(p.dentro)); });
      return d;
    },

    conti: (p) => {
      const c = conti(p);
      const q = el('span', 'conti');
      if (c) q.textContent = c;
      return q;                        // resta anche vuoto: e' lui che spinge il resto a destra
    },

    scadenza: (p) => {
      if (p.chiuso) return el('span', 'scad chiuso', 'chiuso');
      const s = Passi.scadenza(p.entro);
      return s ? el('span', 'scad' + (s.scaduta ? ' scaduta' : ''), s.testo) : null;
    },

    silenzio: (p) => {
      const t = tace(p);
      return el('span', 'tace ' + t.classe, t.testo);
    },

    /* La valvola che sblocca il tabellone. Senza, una mossa che non fai — ma
       che non vuoi nemmeno togliere — tiene il suo progetto fermo in cima per
       tre settimane, e la Bacheca diventa una cosa che smetti di guardare.
       Con questo, la mossa dopo dello stesso progetto prende il suo posto. */
    perOraNo: (p) => {
      if (!p.mossa) return null;
      /* Un simbolo, non tre parole: «per ora no» scritto per esteso pesava
         quanto la mossa e su ogni riga chiedeva di essere letto. Le doppie
         parentesi angolari dicono *avanti, questa la salto* — e la frase intera
         resta nel `title` e nell'etichetta per chi non vede il simbolo. */
      const b = el('button', 'poi', '\u00BB');
      b.title = 'per ora no — la mette da parte per una settimana';
      b.setAttribute('aria-label', b.title);
      b.addEventListener('click', (e) => {
        e.stopPropagation();
        mettiVia(Domande.chiaveDi('mossa', p, p.mossa.testo));
        bacheca();
      });
      return b;
    },

    freccia: () => el('span', 'apri', '›')
  };

  function riga(p, conNomeDelLavoro){
    /* Una `div` e non un `button`: dentro ci sta il nome del lavoro, che e' a
       sua volta da toccare, e un bottone dentro un bottone non e' HTML valido. */
    const b = tinteggia(el('div', 'riga' + (p.dichiarato ? '' : ' proposto')), p);
    b.tabIndex = 0;
    b.setAttribute('role', 'button');

    RIGA.forEach(n => {
      const fai = PARTE_RIGA[n];
      if (!fai) return;
      const nodo = fai(p, conNomeDelLavoro);
      if (nodo) b.append(nodo);
    });

    const vai = () => apri(p);
    b.addEventListener('click', vai);
    b.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' '){ e.preventDefault(); vai(); }
    });
    return b;
  }

  /* ═══ RUBRICA — per chi lavoro ═══════════════════════════════════════════ */

  function rubrica(){
    aperto = null;
    const fuori = [];

    /* Il destinatario è il campo `per:`. Non è una rubrica di contatti — non
       ci sono numeri di telefono e non ce ne saranno: è l'elenco delle persone
       per cui c'è del lavoro aperto, che è una cosa diversa e più utile. */
    /* Due contenitori invece di una chiave finta per «senza destinatario»: una
       chiave magica dentro una mappa di nomi veri è un nome che prima o poi
       qualcuno usa davvero — e qui era anche riuscita a corrompere il file. */
    const gruppi = new Map();
    const senzaNome = [];
    progetti().forEach(p => {
      const chiave = (p.per || '').trim().toLowerCase();
      if (!chiave){ senzaNome.push(p); return; }
      if (!gruppi.has(chiave)) gruppi.set(chiave, { nome: (p.per || '').trim(), progetti: [] });
      gruppi.get(chiave).progetti.push(p);
    });

    const conNome = [...gruppi.values()];
    const senza = senzaNome.length ? { progetti: senzaNome } : null;

    conNome.sort((a, b) => {
      const da = a.progetti.map(p => p.entro).filter(Boolean).sort()[0] || '';
      const db = b.progetti.map(p => p.entro).filter(Boolean).sort()[0] || '';
      if (da && db) return da < db ? -1 : 1;
      if (da) return -1;
      if (db) return 1;
      return Math.max(...b.progetti.map(p => p.quando || 0)) - Math.max(...a.progetti.map(p => p.quando || 0));
    });

    if (!conNome.length){
      fuori.push(dice(
        'Nessun progetto ha un destinatario',
        'Il campo «per» di un progetto dice chi aspetta. Serve a far diventare reale una demo — '
        + 'un nome e una data, se no è un desiderio — e a ritrovare tutto quello che stai facendo '
        + 'per la stessa persona.'));
    }

    conNome.forEach(g => {
      const b = el('div', 'gruppo');
      b.append(el('h2', null, g.nome));
      g.progetti.slice().sort(perScadenza).forEach(p => b.append(riga(p, true)));
      fuori.push(b);
    });

    /* Quello che non e' per nessuno **non e' un buco**: sono le cose tue, e
       si dividono in due che non vanno confuse. Chiamarle tutte «senza
       destinatario» suonava come una mancanza — e per un progetto personale
       non lo e' per niente. */
    if (senza && senza.progetti.length){
      const famiglie = [
        ['sperimentale', 'le cose che potresti vendere',
         'Nessuno le ha chieste. Se funzionano hanno un pubblico — ed è per questo che sono le sole che vanno risvegliate.'],
        ['personale',    'le cose che usi tu',
         'Non le aspetta nessuno, e va bene così: qui il silenzio non è una colpa.'],
        ['',             'non l\'hai ancora detto',
         'Apri una scheda e dille che tipo di lavoro è: da lì l\'app sa come trattarla.']
      ];

      famiglie.forEach(([tipo, titolo, spiega]) => {
        const dentro = senza.progetti.filter(p => (p.tipo || '') === tipo);
        if (!dentro.length) return;
        const b = el('div', 'gruppo');
        b.append(el('h2', null, titolo));
        b.append(el('p', 'occhiello', spiega));
        dentro.slice().sort(perSilenzio).forEach(p => b.append(riga(p, true)));
        fuori.push(b);
      });
    }

    /* Qui, e non nella testata: il posto dove nasce un'idea per qualcuno è
       l'elenco delle persone. */
    const piu = el('button', 'aggiungi-riga', '+  un\'idea per qualcuno');
    piu.addEventListener('click', () => nuovoProgetto('rubrica'));
    fuori.push(piu);

    codaProva(fuori);
    mostra(...fuori);
  }

  /* ═══ CACCIA — chi non è ancora mio ══════════════════════════════════════

     Le altre tre sezioni guardano quello che c'è: le mosse, i progetti, i
     clienti. Questa guarda **quello che non c'è ancora** — le persone a cui
     vorresti proporre qualcosa, e le cose che stai facendo sperando che
     qualcuno le voglia.

     ## Perché una preda non è un progetto

     Avevamo detto che un'idea per qualcuno **è già un progetto, gli manca solo
     la cartella**, ed è vero — quando l'idea c'è. Ma una preda spesso è solo
     un nome e un aggancio: *«a quella pasticceria il menu lo stampano male»*.
     Farne subito un progetto vorrebbe dire creare una cartella vuota che da
     quel momento invecchia e ti accusa. Sarebbe l'app che si spara nei piedi.

     Quindi la caccia tiene i nomi **prima** che diventino progetti, e li
     promuove quando l'idea arriva. Il passaggio è un tocco, e lascia una
     traccia: la preda scende fra le prese, con la data.

     ## Il formato non è nuovo

     `_caccia.md` è un `prossimi-passi.md` come tutti gli altri: le sue caselle
     sono nomi invece che mosse. `Passi` lo sa già leggere e scrivere, quindi
     qui non c'è nessun formato in più da mantenere — e il file si legge e si
     corregge da Claude Code come qualunque altro. */

  const FILE_CACCIA = '_caccia.md';

  /* Le sezioni del file sono quelle di sempre — `## Da fare` e `## Fatte` —
     e non e' pigrizia: `_caccia.md` **e'** un `prossimi-passi.md`, e un
     formato solo vuol dire che `Passi` lo sa gia' fare tutto e che il file si
     corregge da Claude Code come qualunque altro. Le parole diverse stanno a
     schermo, dove servono: sulla lista non e' «da fare», e presa non e'
     «fatta». (Provato il contrario il 2026-08-23: chiamando le sezioni
     «Prese» nel file, spuntare ne creava una seconda in fondo.) */
  const SULLA_LISTA = 'Sulla lista', PRESE = 'Prese';

  let caccioMd = null;    // il file, letto una volta per disegnata

  const nuovaCaccia = () =>
    '# Caccia\n\n'
    + '> chi mi interessa, prima che diventi un progetto\n\n'
    + '## ' + Passi.DA_FARE + '\n\n'
    + '## ' + Passi.FATTE + '\n';

  /* «Pasticceria Bosè — il menu lo stampano male» → nome e aggancio, che sono
     le due cose che il modulo di creazione vuole. Se il trattino non c'è, è
     tutto nome: meglio un campo vuoto che un taglio inventato. */
  function spezza(testo){
    const m = String(testo || '').split(/\s+[—–-]\s+/);
    return { nome: (m[0] || '').trim(), aggancio: m.slice(1).join(' — ').trim() };
  }

  async function cambiaCaccia(trasforma){
    const prima = (await Radice.leggi(FILE_CACCIA)) || nuovaCaccia();
    const dopo = trasforma(prima);
    if (dopo !== prima) await Radice.crea(FILE_CACCIA, dopo);
    await caccia();
  }

  async function caccia(){
    aperto = null;
    caccioMd = await Radice.leggi(FILE_CACCIA);
    const letto = Passi.leggi(caccioMd || nuovaCaccia());
    const fuori = [];

    fuori.push(el('p', 'occhiello',
      'Chi ti interessa e non è ancora un progetto, e le cose che stai provando sperando che qualcuno le voglia.'));

    /* ── sulla lista ────────────────────────────────────────────────── */
    const lista = letto.daFare.map(v => {
      const r = el('div', 'voce');
      r.append(testoModificabile(v.testo, (nuovo) =>
        cambiaCaccia(md => Passi.rinomina(md, v.riga, nuovo, v.testo))));

      const su = el('button', 'su', 'fanne un progetto');
      su.title = 'apre il modulo già compilato, e segna la preda come presa';
      su.addEventListener('click', () => {
        const { nome, aggancio } = spezza(v.testo);
        nuovoProgetto('caccia', { per: nome, problema: aggancio, tipo: 'sperimentale', preda: v });
      });

      const presa = el('button', 'su', 'presa');
      presa.title = 'diventata cliente per un\'altra strada: scende fra le prese';
      presa.addEventListener('click', () => cambiaCaccia(md => Passi.spunta(md, v.riga, v.testo)));

      const via = el('button', 'via', '×');
      via.title = 'togli';
      via.addEventListener('click', () => cambiaCaccia(md => Passi.elimina(md, v.riga, v.testo)));

      r.append(su, presa, via);
      return r;
    });

    if (!lista.length) lista.push(el('p', 'vuoto',
      'Nessun nome. Quelli che tieni in testa non esistono da nessuna parte: è così che si perdono.'));
    lista.push(campoAppendi('un nome, e perché ti interessa…',
      (t) => cambiaCaccia(md => Passi.aggiungiPasso(md, t))));
    fuori.push(blocco(SULLA_LISTA, ...lista));

    /* ── cacce aperte: i progetti sperimentali ──────────────────────── */
    const aperte = progetti().filter(p => p.tipo === 'sperimentale' && !p.chiuso).sort(perScadenza);
    const dentro = aperte.map(p => riga(p, true));
    if (!dentro.length) dentro.push(el('p', 'vuoto',
      'Nessun progetto sperimentale. Sono quelli che nessuno ti ha chiesto — e che, se funzionano, hanno un pubblico.'));
    else {
      const muti = aperte.filter(p => !p.per || !p.entro);
      if (muti.length) dentro.unshift(el('p', 'occhiello',
        muti.length + (muti.length === 1 ? ' non ha' : ' non hanno')
        + ' ancora un nome o una data. Senza quelli è un desiderio, e un desiderio perde contro una commissione tutte le volte.'));
    }
    fuori.push(blocco('Cacce aperte', ...dentro));

    /* ── le prese ───────────────────────────────────────────────────── */
    if (letto.fatte.length){
      const d = el('details', 'fatte');
      d.append(el('summary', null, letto.fatte.length + (letto.fatte.length === 1 ? ' presa' : ' prese')));
      letto.fatte.forEach(v => {
        const r = el('div', 'voce');
        const c = document.createElement('input');
        c.type = 'checkbox'; c.checked = true;
        c.addEventListener('change', () => cambiaCaccia(md => Passi.despunta(md, v.riga, v.testo)));
        r.append(c);
        if (v.data) r.append(el('span', 'data', v.data));
        r.append(el('span', 'testo', soloTesto(v.testo)));
        d.append(r);
      });
      fuori.push(blocco(PRESE, d));
    }

    codaProva(fuori);
    mostra(...fuori);
  }

  /* ═══ UN'IDEA PER QUALCUNO ═══════════════════════════════════════════════
     Il caso vero, e il più difficile da catturare: *«mi è venuto in mente un
     problema, per una certa persona, e entro una certa data potrei prepararle
     qualcosa».* Se resta in testa muore; se viene scomposto e scritto, forse
     no.

     Non serve un concetto nuovo — quel pensiero **è già un progetto**, gli
     manca solo la cartella. Quindi niente «watchlist» a parte con un suo
     formato: un progetto creato vuoto, che da subito invecchia e da subito può
     avere una data. Che è la pressione che a un'idea in testa manca.

     Le soluzioni **non** si chiedono qui: si aggiungono dopo, nella scheda,
     come belle idee. Chiederle adesso vorrebbe dire chiedere il lavoro prima
     dell'intenzione, e l'idea muore al secondo campo. */

  const sciolto = (s) => String(s || '')
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40);

  async function nuovoProgetto(daDove, pre){
    aperto = null;
    pre = pre || {};
    /* Prima quelli incorporati — viaggiano col repo e ci sono sempre — poi
       gli eventuali `.md` in `~/Lavori/_modelli/`, che sono un'aggiunta e non
       una dipendenza: se la cartella non c'è, non manca niente. */
    modelliNoti = (typeof Modelli !== 'undefined' ? Modelli.tutti() : []);
    try { modelliNoti = modelliNoti.concat(await Radice.modelli()); } catch (e){}
    const fuori = [];
    const torna = daDove === 'scrivania' ? scrivania : daDove === 'caccia' ? caccia : rubrica;

    const indietro = el('button', 'indietro',
      daDove === 'scrivania' ? '←  la scrivania' : daDove === 'caccia' ? '←  la caccia' : '←  la rubrica');
    indietro.addEventListener('click', torna);
    fuori.push(indietro);

    const f = el('form', 'nuovo');
    f.append(el('h1', null,
      daDove === 'scrivania' ? 'Un progetto nuovo'
      : daDove === 'caccia' ? 'Da preda a progetto'
      : 'Un\'idea per qualcuno'));
    f.append(el('p', 'occhiello', daDove === 'scrivania'
      ? 'Nasce con la sua cartella e il suo file. Quello che non sai ancora si lascia vuoto.'
      : daDove === 'caccia'
      ? 'Quando l\'idea c\'è, la preda diventa un progetto — e scende fra le prese.'
      : 'Scrivila adesso che ce l\'hai in testa. Le soluzioni le aggiungi dopo.'));

    const campo = (etichetta, tipo, invito) => {
      const l = el('label', null, etichetta);
      const i = document.createElement('input');
      i.type = tipo; if (invito) i.placeholder = invito;
      i.autocomplete = 'off';
      l.append(i); f.append(l);
      return i;
    };

    const nome     = campo('come si chiama', 'text', 'nome-del-progetto');
    if (pre.per) nome.value = sciolto(pre.per);

    /* Dentro quale cartella. È il livello che ti fa dire «cantera e
       jesommelier sono due progetti della stessa cartella»: qui lo scegli
       invece di doverlo spostare nel Finder dopo. */
    const lab = el('label', null, 'dentro quale cartella');
    const dove = document.createElement('select');
    const suo = document.createElement('option');
    suo.value = ''; suo.textContent = '— una cartella nuova, sua —';
    dove.append(suo);
    (lavori || []).slice()
      .sort((a, b) => a.nome.localeCompare(b.nome, 'it'))
      .forEach(l => { const o = document.createElement('option'); o.value = l.nome; o.textContent = l.nome; dove.append(o); });
    lab.append(dove); f.append(lab);

    /* Il tipo si sceglie **prima** del destinatario, perche' e' lui a decidere
       che domanda ha senso fare dopo. Dentro una cartella che ha gia' altri
       progetti si propone `commissione`: e' quasi sempre giusto, e resta
       cambiabile — il caso prezioso e' proprio quello che sfugge alla regola. */
    let tipoScelto = pre.tipo || '';
    const labT = el('label', null, 'che tipo di lavoro è');
    const casaT = el('div');
    labT.append(casaT); f.append(labT);

    const per = campo('per chi', 'text', 'una persona, un\'azienda — facoltativo');
    per.setAttribute('list', 'clienti-noti');
    if (pre.per) per.value = pre.per;
    f.append(elencoClienti());

    const ridisegnaTipo = () => {
      casaT.replaceChildren(selettoreTipo(tipoScelto, (v) => { tipoScelto = v; ridisegnaTipo(); }));
      const etichetta = [...f.querySelectorAll('label')].find(l => l.contains(per));
      if (etichetta) etichetta.childNodes[0].textContent = chiedePerChi(tipoScelto);
    };
    ridisegnaTipo();

    /* Il modello: un progetto vuoto ben scritto, da cui partire. Sta dopo il
       tipo perche' e' il tipo a dire quale ha senso, e prima del perche'
       perche' il modello ne porta gia' uno da correggere. */
    const labM = el('label', null, 'da quale modello');
    const mod = document.createElement('select');
    const senza = document.createElement('option');
    senza.value = ''; senza.textContent = '— nessuno, parte vuoto —';
    mod.append(senza);
    modelliNoti.forEach(m => {
      const o = document.createElement('option');
      o.value = m.id || m.percorso;
      o.textContent = m.nome + (m.descrizione ? ' — ' + m.descrizione : '');
      mod.append(o);
    });
    labM.append(mod);
    if (modelliNoti.length) f.append(labM);

    const problema = campo(daDove === 'scrivania' ? 'perché esiste' : 'che problema ha',
                           'text', 'una riga, quella che diresti a voce');
    if (pre.problema) problema.value = pre.problema;
    const entro    = campo(daDove === 'scrivania' ? 'entro quando' : 'entro quando potresti mostrargli qualcosa', 'date');

    /* Il colore: si vede subito com'è, perché la pastiglia «come la cartella»
       cambia insieme alla cartella scelta qui sopra. */
    let colore = '';
    const labC = el('label', null, 'colore');
    const casa = el('div');
    labC.append(casa); f.append(labC);

    const ridisegnaTavolozza = () => {
      const finto = { nome: nome.value || 'nuovo', dentro: dove.value || null, colore };
      casa.replaceChildren(tavolozza(colore, finto, (v) => { colore = v; ridisegnaTavolozza(); }));
    };
    ridisegnaTavolozza();
    dove.addEventListener('change', () => {
      ridisegnaTavolozza();
      if (!tipoScelto && dove.value){ tipoScelto = 'commissione'; ridisegnaTipo(); }
    });

    /* Il nome della cartella si scrive da sé, e resta correggibile: è una
       tecnicalità, non una decisione da prendere nel momento dell'idea. */
    if (daDove !== 'scrivania'){
      let toccato = false;
      nome.addEventListener('input', () => { toccato = true; });
      per.addEventListener('input', () => { if (!toccato){ nome.value = sciolto(per.value); ridisegnaTavolozza(); } });
    }
    nome.addEventListener('input', ridisegnaTavolozza);

    const via = el('button', 'grosso', 'crea il progetto');
    via.type = 'submit';
    f.append(via);

    const esito = el('p', 'vuoto');
    f.append(esito);

    f.addEventListener('submit', async (e) => {
      e.preventDefault();
      const cartella = sciolto(nome.value || per.value || problema.value);
      if (!cartella){ esito.textContent = 'Serve almeno un nome.'; return; }

      const dentroA = dove.value;
      const percorso = (dentroA ? dentroA + '/' : '') + cartella;

      const gia = dentroA
        ? ((lavoroDi(dentroA) || { progetti: [] }).progetti.some(x => x.nome.toLowerCase() === cartella))
        : (lavori || []).some(l => l.nome.toLowerCase() === cartella);
      if (gia){ esito.textContent = 'C\'è già qualcosa che si chiama ' + percorso + '.'; return; }

      via.disabled = true;
      esito.textContent = 'creo ' + percorso + '/…';

      const partenza = !mod.value ? null
        : mod.value.startsWith('incorporato:') ? Modelli.testoDi(mod.value)
        : await Radice.leggi(mod.value);
      let md = partenza
        ? Passi.daModello(partenza, cartella, problema.value.trim())
        : Passi.nuovo(cartella, problema.value.trim());
      if (tipoScelto)       md = Passi.scriviCampo(md, 'tipo', tipoScelto);
      if (per.value.trim()) md = Passi.scriviCampo(md, 'per', per.value.trim());
      if (entro.value)      md = Passi.scriviCampo(md, 'entro', entro.value);
      if (colore)           md = Passi.scriviCampo(md, 'colore', colore);

      await Radice.crea(percorso + '/' + Radice.FILE_PASSI, md);

      /* La preda scende fra le prese, e la traccia resta: fra sei mesi vuoi
         sapere che quel nome l'avevi inseguito e com'e' finita. */
      if (pre.preda){
        const c = (await Radice.leggi(FILE_CACCIA)) || '';
        const dopoC = Passi.spunta(c, pre.preda.riga, pre.preda.testo);
        if (dopoC !== c) await Radice.crea(FILE_CACCIA, dopoC);
      }

      await scandaglia();
      const nato = progetti().find(x => x.nome === cartella && (x.dentro || null) === (dentroA || null));
      if (nato) await apri(nato);
    });

    fuori.push(f);
    mostra(...fuori);
    setTimeout(() => (daDove === 'scrivania' ? nome : per).focus(), 0);
  }

  /* ═══ LA SCHEDA DI UN PROGETTO ═══════════════════════════════════════════ */

  const filePassi = (p) => p.percorso + '/' + Radice.FILE_PASSI;

  async function apri(p){
    if (!p) return;
    modificaAperta = false;
    aperto = { p, md: null, altrove: [] };
    mostra(el('p', 'attesa', 'apro ' + p.nome + '…'));
    await ricarica();
  }

  async function ricarica(){
    if (!aperto) return;
    const p = aperto.p;
    aperto.md = p.dichiarato ? await Radice.leggi(filePassi(p)) : null;
    aperto.altrove = await Radice.caselleAltrove(p.percorso, p.soloRadice);

    /* I conti vengono dallo scandaglio, che è di prima. Se non si
       aggiornassero qui, tornando indietro dopo aver spuntato una cosa
       l'elenco direbbe ancora il numero vecchio — e un numero fermo su una
       schermata che esiste per dirti come stanno le cose è peggio di nessun
       numero. */
    const letto = p.dichiarato ? Passi.leggi(aperto.md || '') : { daFare: [], fatte: [] };
    p.aperte = letto.daFare.length + aperto.altrove.reduce((n, f) => n + f.voci.length, 0);
    p.fatte  = letto.fatte.length  + aperto.altrove.reduce((n, f) => n + (f.fatte || 0), 0);

    scheda();
  }

  /* Ogni gesto passa di qui: rilegge, trasforma, scrive. Se la trasformazione
     non cambia niente vuol dire che la riga non era più quella che credevamo —
     il file è cambiato sotto, e si ricarica invece di insistere. */
  async function cambia(percorso, trasforma){
    const prima = (await Radice.leggi(percorso)) || '';
    const dopo = trasforma(prima);
    if (dopo !== prima){
      await Radice.scrivi(percorso, dopo);
      aperto.p.quando = Date.now();     // l'hai appena toccato: non tace più
    }
    await ricarica();
  }

  const cambiaPassi = (trasforma) => cambia(filePassi(aperto.p), trasforma);

  function testoModificabile(testo, salva){
    const s = el('span', 'testo', testo);
    s.contentEditable = 'true';
    s.spellcheck = false;
    s.addEventListener('keydown', (e) => {
      if (e.key === 'Enter'){ e.preventDefault(); s.blur(); }
      if (e.key === 'Escape'){ s.textContent = testo; s.blur(); }
    });
    s.addEventListener('blur', () => {
      const nuovo = s.textContent.trim();
      if (nuovo && nuovo !== testo) salva(nuovo); else s.textContent = testo;
    });
    return s;
  }

  function campoAppendi(invito, salva){
    const f = el('form', 'appendi');
    const i = el('input');
    i.placeholder = invito;
    i.autocomplete = 'off';
    const b = el('button', null, 'aggiungi');
    b.type = 'submit';
    f.append(i, b);
    f.addEventListener('submit', (e) => {
      e.preventDefault();
      const t = i.value.trim();
      if (!t) return;
      i.value = '';
      salva(t);
    });
    return f;
  }

  function blocco(titolo, ...dentro){
    const b = el('div', 'blocco');
    b.append(el('h2', null, titolo), ...dentro);
    return b;
  }

  /* ── i pezzi della scheda ──────────────────────────────────────────────
     Ogni pezzo e' una funzione col suo nome, e non sa dove finira': l'ordine
     lo decide la lista `SCHEDA` in cima al file. Riceve il contesto — il
     progetto e il suo file gia' letto — e restituisce un nodo, un elenco di
     nodi, oppure `null` se in questa scheda non ha niente da dire. */

  const PEZZI = {

    testa: ({ p }) => {
      const testa = el('div', 'scheda');
      testa.append(el('h1', null, p.nome));
      const t = tace(p);
      const sotto = el('p', 'sotto');
      if (p.dentro) sotto.append(el('span', null, 'in ' + p.dentro + ' · '));
      sotto.append(el('b', null,
        t.testo === 'oggi' || t.testo === 'ieri' ? 'toccato ' + t.testo : 'tace da ' + t.testo));
      testa.append(sotto);
      return testa;
    },

    /* Non ancora un progetto: l'app **propone**, non decide — e dichiararlo e'
       crearlo, perche' il tocco scrive il `prossimi-passi.md`. */
    proponi: ({ p }) => p.dichiarato ? null : dice(
      'Questa cartella non è ancora un progetto',
      'Dentro c\'è roba di lavoro, quindi te la propongo — ma decidere che cos\'è tocca a te. '
      + 'Farne un progetto scrive ' + Radice.FILE_PASSI + ' qui dentro, e da lì ha un perché, '
      + 'le sue idee e i suoi passi.',
      'Fanne un progetto',
      async () => {
        await Radice.scrivi(filePassi(p), Passi.nuovo(p.nome));
        p.dichiarato = true; p.tipo = 'progetto'; p.quando = Date.now();
        await ricarica();
      }),

    /* Il patto sta **dietro un bottone**. Chi aspetta, entro quando e di che
       colore sono cose che si mettono una volta: se restassero aperte, ogni
       volta che apri un progetto la prima cosa che vedi sarebbero tre campi da
       riempire invece del perche' per cui ti piaceva. */
    patto: ({ p, letto }) => {
      if (!letto) return null;
      const r = el('div', 'patto');
      const s = Passi.scadenza(letto.entro);
      r.append(tinteggia(el('span', 'pallino grande'), p));
      const pezzi = [];
      if (letto.tipo) pezzi.push(DETTO[letto.tipo].corto);
      pezzi.push(letto.per ? 'per ' + letto.per : 'nessuno aspetta');
      if (s) pezzi.push('entro il ' + letto.entro);
      r.append(el('span', 'detto', pezzi.join(' · ')));
      const tasto = el('button', 'min', modificaAperta ? 'chiudi le impostazioni' : 'modifica');
      tasto.addEventListener('click', () => { modificaAperta = !modificaAperta; scheda(); });
      r.append(tasto);
      return r;
    },

    impostazioni: ({ p, letto }) => {
      if (!letto || !modificaAperta) return null;
      const m = el('div', 'modifica');

      const l0 = el('label', null, 'che tipo di lavoro è');
      l0.append(selettoreTipo(letto.tipo, (v) => cambiaPassi(md => Passi.scriviCampo(md, 'tipo', v))));

      const perE = document.createElement('input');
      perE.type = 'text'; perE.value = letto.per; perE.placeholder = 'nessuno, per ora';
      perE.setAttribute('list', 'clienti-noti');
      perE.addEventListener('change', () => cambiaPassi(md => Passi.scriviCampo(md, 'per', perE.value)));
      const l1 = el('label', null, chiedePerChi(letto.tipo)); l1.append(perE);

      const entroE = document.createElement('input');
      entroE.type = 'date'; entroE.value = letto.entro;
      entroE.addEventListener('change', () => cambiaPassi(md => Passi.scriviCampo(md, 'entro', entroE.value)));
      const l2 = el('label', null, 'entro'); l2.append(entroE);

      const l3 = el('label', null, 'colore');
      l3.append(tavolozza(letto.colore, p, (v) => cambiaPassi(md => Passi.scriviCampo(md, 'colore', v))));

      const chiudi = el('button', 'min', letto.chiuso ? 'riapri il progetto' : 'chiudi il progetto');
      chiudi.addEventListener('click', () =>
        cambiaPassi(md => Passi.scriviCampo(md, 'chiuso', letto.chiuso ? '' : Passi.oggi())));

      m.append(l0, l1, l2, l3, elencoClienti(), chiudi);
      return m;
    },

    /* La data passata fa una **domanda**, non una multa. «Lascio perdere» e'
       una risposta legittima e costa un tocco: un'app che ti mette in mora e'
       un'app che smetti di aprire. */
    avviso: ({ letto }) => {
      if (!letto) return null;
      if (letto.chiuso) return dice('Chiuso il ' + letto.chiuso,
        'Non è stato cancellato niente: è solo uscito dagli elenchi e non ti chiede più niente. '
        + 'Riaprirlo lo rimette in fila dov\'era.');
      const s = Passi.scadenza(letto.entro);
      if (!s || !s.scaduta) return null;
      return dice('La data è passata da ' + (-s.giorni) + ' giorni',
        'Succede, e non vuol dire niente di male. Mettine un\'altra qui sopra, oppure togli la data: '
        + 'resta un progetto senza nessuno che aspetta, che è una cosa onesta.',
        'Lascio perdere la data',
        () => cambiaPassi(md => Passi.scriviCampo(md, 'entro', '')));
    },

    /* Il perche', che e' la prima cosa che leggi tornando dopo mesi. */
    perche: ({ letto }) => {
      if (!letto) return null;
      const q = el('blockquote', 'perche' + (letto.perche ? '' : ' vuoto'),
        letto.perche || 'perché esiste — scrivilo adesso, che te lo ricordi');
      q.contentEditable = 'true';
      q.spellcheck = false;
      q.addEventListener('focus', () => { if (!letto.perche) q.textContent = ''; });
      q.addEventListener('keydown', (e) => { if (e.key === 'Enter'){ e.preventDefault(); q.blur(); } });
      q.addEventListener('blur', () => {
        const nuovo = q.textContent.trim();
        if (nuovo !== (letto.perche || '')) cambiaPassi(md => Passi.scriviPerche(md, nuovo));
        else if (!nuovo) scheda();
      });
      return q;
    },

    /* Le belle idee — quelle che «mi ero dimenticato di aver avuto».

       Stanno **sotto** le cose da fare e **piegate**, e il motivo è che non
       pesano allo stesso modo: una cosa da fare è un impegno, un'idea è un
       cassetto da cui attingi quando ti va. Aperte e per prime, la scheda
       apriva chiedendoti di guardare cose che non devi fare — e la cosa da
       fare, che è il motivo per cui hai aperto la scheda, stava sotto.

       Piegate ma **sempre presenti**: anche a cassetto vuoto la riga c'è, o il
       campo per scriverne una diventerebbe irraggiungibile proprio nel momento
       in cui l'idea ti viene. */
    idee: ({ letto }) => {
      if (!letto) return null;
      const dentro = letto.idee.map(v => {
        const r = el('div', 'idea');
        r.append(testoModificabile(v.testo, (nuovo) =>
          cambiaPassi(md => Passi.rinomina(md, v.riga, nuovo, v.testo))));
        const su = el('button', 'su', 'da fare');
        su.title = 'diventa una cosa da fare';
        su.addEventListener('click', () => cambiaPassi(md => Passi.promuoviIdea(md, v.riga, v.testo)));
        const via = el('button', 'via', '×');
        via.title = 'togli';
        via.addEventListener('click', () => cambiaPassi(md => Passi.elimina(md, v.riga, v.testo)));
        r.append(su, via);
        return r;
      });
      if (!dentro.length) dentro.push(el('p', 'vuoto', 'Niente ancora. Le idee che ti vengono su questo progetto vanno qui.'));
      dentro.push(campoAppendi('un\'idea che ti è venuta…', (t) => cambiaPassi(md => Passi.aggiungiIdea(md, t))));

      const d = el('details', 'idee');
      d.open = ideeAperte;
      d.addEventListener('toggle', () => { ideeAperte = d.open; });
      const n = letto.idee.length;
      d.append(el('summary', null,
        n === 0 ? 'nessuna bella idea, ancora' : n === 1 ? 'una bella idea' : n + ' belle idee'));
      d.append(...dentro);
      return d;
    },

    /* Da fare — le caselle di casa, quelle che The Office puo' muovere. */
    daFare: ({ letto }) => {
      if (!letto) return null;
      const dentro = letto.daFare.map((v, i) => {
        /* Un passo grosso pesa, una cosa fine rientra: senza, la scheda è un
           elenco piatto di ventiquattro righe e la struttura che il modello
           porta non si vede più. */
        const grosso = v.rientro === 0;
        const r = el('div', 'voce' + (i === 0 ? ' prima' : '') + (grosso ? ' passo' : ' fine'));
        if (grosso && v.figli) r.dataset.figli = v.figli.fatti + ' di ' + v.figli.totali;
        const c = document.createElement('input');
        c.type = 'checkbox';
        c.addEventListener('change', () => cambiaPassi(md => Passi.spunta(md, v.riga, v.testo)));
        r.append(c, testoModificabile(v.testo, (nuovo) =>
          cambiaPassi(md => Passi.rinomina(md, v.riga, nuovo, v.testo))));
        const via = el('button', 'via', '×');
        via.title = 'togli';
        via.addEventListener('click', () => cambiaPassi(md => Passi.elimina(md, v.riga, v.testo)));
        r.append(via);

        /* La nota della fase, sotto di lei. È il perché di quel passo, e senza
           un modello resta un elenco di comandi. */
        if (grosso && v.nota){
          const con = el('div', 'conNota');
          con.append(r, el('p', 'nota', v.nota));
          return con;
        }
        return r;
      });
      if (!dentro.length) dentro.push(el('p', 'vuoto', 'Niente da fare qui dentro. Una mossa sola basta.'));
      dentro.push(campoAppendi('la prossima mossa…', (t) => cambiaPassi(md => Passi.aggiungiPasso(md, t))));
      return blocco(Passi.DA_FARE, ...dentro);
    },

    /* Le fatte: chiuse, ma contate. E' il numero che ti fa riaprire un progetto
       dopo tre mesi — «guarda quanto avevi gia' fatto». */
    fatte: ({ letto }) => {
      if (!letto || !letto.fatte.length) return null;
      const d = el('details', 'fatte');
      d.append(el('summary', null, letto.fatte.length + (letto.fatte.length === 1 ? ' cosa fatta' : ' cose fatte')));
      letto.fatte.forEach(v => {
        const r = el('div', 'voce');
        const c = document.createElement('input');
        c.type = 'checkbox'; c.checked = true;
        c.addEventListener('change', () => cambiaPassi(md => Passi.despunta(md, v.riga, v.testo)));
        r.append(c);
        if (v.data) r.append(el('span', 'data', v.data));
        r.append(el('span', 'testo', soloTesto(v.testo)));
        d.append(r);
      });
      return blocco(Passi.FATTE, d);
    },

    /* Le cartelle qui dentro. E' il posto — l'unico — dove l'app propone: qui
       vedi `food-cost-urby` fermo da centocinquanta giorni dentro un `urby`
       che sembra vivo, e con un tocco diventa un progetto. */
    figli: ({ p }) => {
      const lav = p.dentro === null ? lavoroDi(p.nome) : null;
      const figli = lav ? lav.progetti.filter(x => x.dentro !== null) : [];
      if (!figli.length) return null;
      const dentro = figli.slice().sort(perSilenzio).map(f => {
        const r = riga(f, false);
        if (f.tipo === 'materiale') r.append(el('span', 'altrove', 'materiale'));
        return r;
      });
      return blocco('cartelle qui dentro', ...dentro);
    },

    /* Le caselle che stanno negli altri file. Qui The Office spunta e basta:
       `consegna.md` ha le caselle numerate e intrecciate alla prosa, e
       spostarle distruggerebbe il documento. */
    altrove: ({ p }) => aperto.altrove.map(f => {
      const dentro = f.voci.map(v => {
        const r = el('div', 'voce');
        const c = document.createElement('input');
        c.type = 'checkbox';
        c.addEventListener('change', () =>
          cambia(p.percorso + '/' + f.file, md => Passi.spuntaSulPosto(md, v.riga, true, v.testo)));
        r.append(c, el('span', 'testo', soloTesto(v.testo)));
        return r;
      });
      const b = blocco(f.file, ...dentro);
      b.querySelector('h2').append(el('span', 'altrove', ' spuntate sul posto'));
      return b;
    })
  };

  function scheda(){
    const p = aperto.p;
    const contesto = { p, letto: p.dichiarato ? Passi.leggi(aperto.md || '') : null };

    const indietro = el('button', 'indietro', '←  indietro');
    indietro.addEventListener('click', disegna);

    const fuori = [indietro];
    SCHEDA.forEach(nome => {
      const fai = PEZZI[nome];
      if (!fai) return;                      // un nome che non esiste si salta
      const n = fai(contesto);
      if (!n) return;
      if (Array.isArray(n)) fuori.push(...n.filter(Boolean));
      else fuori.push(n);
    });

    mostra(...fuori);
  }

  return { avvia };
})();

/* Gli script si caricano da soli (vedi `index.html`), quindi può capitare
   che `DOMContentLoaded` sia già passato quando questo file arriva: in quel
   caso l'ascoltatore non scatterebbe mai e l'app resterebbe bianca. */
if (document.readyState === 'loading')
  document.addEventListener('DOMContentLoaded', Ufficio.avvia);
else
  Ufficio.avvia();
