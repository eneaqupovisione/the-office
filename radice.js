/* ═══════════════════════════════════════════════════════════════════════════
   LA RADICE — `~/Lavori` collegata una volta, e da lì tutto il resto.

   Il vecchio ponte conosceva i cinque domini dell'albero (`prodotti/`,
   `clienti/`, `studio/`…). Qui quel livello **non c'è**: le cartelle di lavoro
   sono il primo livello di `~/Lavori`, i progetti sono loro figli, e un lavoro
   senza figli è lui stesso il progetto (`tablewise`, `muscle-map`).

   ## Il silenzio, e perché si calcola invece di scriverlo

   Il segnale su cui si regge tutta l'app è **da quanto un progetto tace**: la
   data dell'ultimo file modificato dentro di lui. Non si dichiara, quindi non
   si può dimenticare di aggiornarlo — ed è l'unico modo di avere un dato
   giusto *proprio per i progetti che hai abbandonato*, che sono quelli per cui
   qualunque stato scritto a mano sarebbe vecchio.

   Si usa la data di **modifica**, non quella di accesso: l'accesso lo aggiorna
   Spotlight, lo aggiorna un backup, lo aggiorna una ricerca. Aprire un
   progetto, guardarlo e richiuderlo non deve farlo sembrare vivo — è esatta-
   mente il gesto che viene prima del sotterramento.

   ## Lo scandaglio è limitato, e sbaglia sempre dalla parte giusta

   `cantera/cantera/node_modules` da solo sono 26.413 file su 27.006: senza un
   limite, aprire l'app vorrebbe dire aspettare. Quindi si saltano le cartelle
   che non dicono niente su quando hai lavorato, si scende al massimo di cinque
   livelli e ci si ferma a 400 file per progetto.

   Il limite può far sembrare un progetto **più silenzioso di quanto sia**, mai
   più vivo: si prende il massimo delle date, e guardarne di meno può solo
   abbassare quel massimo. Per un'app che esiste per non farti perdere i
   progetti, è l'unico verso in cui è accettabile sbagliare.
   ═══════════════════════════════════════════════════════════════════════ */

const Radice = (() => {

  const DB = 'the-office-maniglie', DEPOSITO = 'maniglie', TASTO = 'lavori';

  const SALTA = new Set([
    'node_modules', '.git', 'dist', 'build', '.next', '.nuxt', '.svelte-kit',
    'venv', '.venv', '__pycache__', '.cache', 'vendor', 'Pods', 'target',
    'coverage', '.parcel-cache', '.turbo', '.DS_Store', 'Icon\r'
  ]);

  const PROFONDITA_MAX = 5;
  const FILE_MAX       = 400;   /* per progetto */
  const MD_MAX         = 40;    /* .md letti per contare le caselle */

  /* Le estensioni che dicono «qui dentro si lavora». Una cartella di sole foto
     o di soli video è materiale del progetto, non un progetto. */
  const LAVORO = /\.(md|html?|css|js|jsx|ts|tsx|py|json|sh|rb|go|rs|swift|php|sql|toml|yml|yaml|csv)$/i;

  const FILE_PASSI = 'prossimi-passi.md';

  let radice = null;

  /* ── la maniglia, che deve sopravvivere alla chiusura ────────────────── */
  /* Una `FileSystemDirectoryHandle` non entra in `localStorage`: non è
     serializzabile. IndexedDB sì, ed è l'unico magazzino che la sappia tenere. */

  function apriDb(){
    return new Promise((ok, no) => {
      const req = indexedDB.open(DB, 1);
      req.onupgradeneeded = () => req.result.createObjectStore(DEPOSITO);
      req.onsuccess = () => ok(req.result);
      req.onerror   = () => no(req.error);
    });
  }

  async function conserva(h){
    const db = await apriDb();
    return new Promise((ok, no) => {
      const t = db.transaction(DEPOSITO, 'readwrite');
      h ? t.objectStore(DEPOSITO).put(h, TASTO) : t.objectStore(DEPOSITO).delete(TASTO);
      t.oncomplete = ok; t.onerror = () => no(t.error);
    });
  }

  async function recupera(){
    try{
      const db = await apriDb();
      return await new Promise((ok, no) => {
        const req = db.transaction(DEPOSITO, 'readonly').objectStore(DEPOSITO).get(TASTO);
        req.onsuccess = () => ok(req.result || null);
        req.onerror   = () => no(req.error);
      });
    } catch (e){ return null; }
  }

  const possibile = () => typeof window.showDirectoryPicker === 'function';
  const collegata = () => !!radice;
  const nome      = () => radice ? radice.name : '';

  /* Il permesso scade da solo dopo un po' che l'app non si apre, e quando
     scade l'app **non deve mostrare zero progetti come se avessi finito
     tutto**: chi chiama distingue `null` (permesso da rinnovare) da `[]`. */
  async function permesso(chiedendolo){
    if (!radice) return false;
    const q = await radice.queryPermission({ mode: 'readwrite' });
    if (q === 'granted') return true;
    if (!chiedendolo) return false;                 // `requestPermission` vuole un gesto
    return (await radice.requestPermission({ mode: 'readwrite' })) === 'granted';
  }

  async function riprendi(){
    if (!possibile()) return false;
    radice = await recupera();
    return !!radice && (await permesso(false));
  }

  async function collega(){
    const h = await window.showDirectoryPicker({ id: 'lavori', mode: 'readwrite' });
    if ((await h.requestPermission({ mode: 'readwrite' })) !== 'granted') return false;
    radice = h;
    await conserva(h);
    return true;
  }

  async function scollega(){ radice = null; await conserva(null); }

  /* ── camminare dentro una cartella ───────────────────────────────────── */

  const saltare = (n) => SALTA.has(n) || n.startsWith('.');

  async function figlie(dir){
    const fuori = [];
    for await (const [n, h] of dir.entries())
      if (h.kind === 'directory' && !saltare(n)) fuori.push({ nome: n, maniglia: h });
    fuori.sort((a, b) => a.nome.localeCompare(b.nome, 'it'));
    return fuori;
  }

  async function ha(dir, file){
    try { await dir.getFileHandle(file); return true; }
    catch (e){ return false; }
  }

  /* Il cuore: l'ultima modifica, e le caselle, in una passata sola.
     `soloRadice` serve al lavoro che è anche progetto: le sue date sono quelle
     dei file sciolti alla sua radice, **non** quelle dei suoi figli — se no un
     lavoro sembrerebbe sempre vivo quanto il più vivo dei suoi progetti, e
     `urby` continuerebbe a nascondere `food-cost-urby` fermo da 150 giorni. */
  async function misura(dir, soloRadice){
    let quando = 0, aperte = 0, fatte = 0, visti = 0, letti = 0;
    let prima = null;      // la prima casella aperta che si incontra

    async function dentro(d, sotto, livello){
      if (visti >= FILE_MAX || livello > PROFONDITA_MAX) return;
      const cartelle = [];
      for await (const [n, h] of d.entries()){
        if (visti >= FILE_MAX) return;
        if (saltare(n)) continue;
        if (h.kind === 'directory'){ if (!soloRadice) cartelle.push([n, h]); continue; }
        visti++;
        try{
          const f = await h.getFile();
          if (f.lastModified > quando) quando = f.lastModified;
          if (/\.md$/i.test(n) && letti < MD_MAX){
            letti++;
            const righe = (await f.text()).split('\n');
            righe.forEach((riga, i) => {
              const m = riga.match(/^\s*-\s\[([ xX])\]\s?(.*)$/);
              if (!m) return;
              if (m[1] !== ' '){ fatte++; return; }
              aperte++;
              /* La prima che si incontra fa da ripiego per la bacheca, quando
                 un progetto non ha un `prossimi-passi.md` da cui pescare. */
              if (!prima) prima = { file: (sotto ? sotto + '/' : '') + n, riga: i, testo: m[2].trim() };
            });
          }
        } catch (e){ /* un file che sparisce sotto i piedi non è un errore */ }
      }
      for (const [n, h] of cartelle) await dentro(h, (sotto ? sotto + '/' : '') + n, livello + 1);
    }

    await dentro(dir, '', 1);
    return { quando, aperte, fatte, prima, troncato: visti >= FILE_MAX };
  }

  /* ── che cos'è una cartella ──────────────────────────────────────────── */
  /* Un progetto è una cartella **che ha il suo `prossimi-passi.md`**, e non
     c'è nessun altro modo di diventarlo: lo dichiari tu, e dichiararlo è
     crearlo, perché il tocco scrive il file.

     Qui c'era una regola che indovinava — «se dentro c'è un `.md` o un `.json`
     allora è un progetto» — ed è caduta il 2026-08-21 contro `~/Lavori` vera:
     `vittoria/foto` sono quattrocento jpg con in mezzo un `indice.json`,
     `vittoria/contenuti` è un `SEGNAPOSTO.md`, `vittoria/marca` è una
     `direzione.md`. Tutte e tre passavano per progetti, e l'elenco del primo
     giorno era di quaranta righe di cui trenta sbagliate.

     Niente regola meccanica sa distinguere una cartella di materiale da un
     progetto, perché la differenza non è nei file: è in cosa ci vuoi fare.
     Quindi l'app **non prova nemmeno**. `LAVORO` resta come indizio da mostrare
     accanto a una cartella, mai come verdetto. */

  async function indiziDiLavoro(dir){
    for await (const [n, h] of dir.entries()){
      if (saltare(n)) continue;
      if (h.kind === 'file' && LAVORO.test(n)) return true;
    }
    return false;
  }

  async function esamina(maniglia, nomeCartella, dentroA, soloRadice){
    const dichiarato = await ha(maniglia, FILE_PASSI);
    const m = await misura(maniglia, soloRadice);

    /* I tre campi si leggono già qui, durante lo scandaglio: la bacheca deve
       poter ordinare per scadenza e nascondere i chiusi senza aprire quaranta
       schede. Il formato lo conosce `passi.js`, e resta uno solo — leggerlo
       due volte in due file sarebbe il modo più veloce di farli divergere. */
    let c = {};
    let mossa = m.prima;
    if (dichiarato){
      try {
        const testo = await (await (await maniglia.getFileHandle(FILE_PASSI)).getFile()).text();
        c = Passi.campi(testo);
        /* La prossima mossa viene dal `## Da fare` del progetto, se ce l'ha:
           è quella che hai scelto tu. La prima casella trovata in giro è solo
           il ripiego per i progetti che un `prossimi-passi.md` non ce l'hanno
           ancora — meglio una mossa presa da `consegna.md` che nessuna. */
        const letto = Passi.leggi(testo);
        if (letto.daFare.length)
          mossa = { file: FILE_PASSI, riga: letto.daFare[0].riga, testo: letto.daFare[0].testo, sua: true };
      } catch (e){ /* illeggibile: il progetto resta, senza campi */ }
    }

    return {
      nome: nomeCartella, dentro: dentroA, dichiarato,
      tipo: dichiarato ? 'progetto' : (await indiziDiLavoro(maniglia)) ? 'candidato' : 'materiale',
      percorso: (dentroA ? dentroA + '/' : '') + nomeCartella,
      quando: m.quando, aperte: m.aperte, fatte: m.fatte, troncato: m.troncato,
      mossa,
      per: c.per || '', entro: c.entro || '', chiuso: c.chiuso || '', colore: c.colore || '',
      soloRadice: !!soloRadice
    };
  }

  /* ── lo scandaglio ───────────────────────────────────────────────────── */
  /* `avanti(fatti, totali, cosa)` viene chiamata mentre lavora: l'attesa deve
     dire a che punto è, non lasciare una schermata ferma. */

  async function scandaglia(avanti){
    if (!radice) return null;
    if (!(await permesso(false))) return null;

    const cartelle = await figlie(radice);
    const fuori = [];
    let fatti = 0;

    for (const c of cartelle){
      if (avanti) avanti(fatti, cartelle.length, c.nome);

      const sotto = await figlie(c.maniglia);
      const progetti = [];
      for (const s of sotto) progetti.push(await esamina(s.maniglia, s.nome, c.nome, false));

      /* Il lavoro è anche un progetto a sé quando alla sua radice ci sono file
         sciolti: `urby-v11.html` in `urby/`, `roma-v6.html` in `bar-roma/`, e
         tutto `tablewise`, che di file ne ha uno solo. Le sue date sono quelle
         dei file di radice e basta — se no `urby` sembrerebbe vivo quanto il
         suo figlio più vivo, e continuerebbe a nascondere `food-cost-urby`
         fermo da centocinquanta giorni. */
      const suo = await esamina(c.maniglia, c.nome, null, true);
      if (suo.quando) progetti.unshift(suo);

      /* E il lavoro **intero**, ricorsivo: è la riga che compare nell'elenco
         finché dentro non hai dichiarato nemmeno un progetto. */
      const tutto = await misura(c.maniglia, false);

      /* La tinta della cartella è quella dichiarata dal suo progetto-radice, se
         ce l'ha: così i figli la ereditano invece di prendersene una a testa.
         Se non c'è, chi disegna la deduce dal nome. */
      fuori.push({
        nome: c.nome, percorso: c.nome, progetti,
        quando: tutto.quando, aperte: tutto.aperte, fatte: tutto.fatte,
        colore: suo.colore || '',
        dichiarato: progetti.some(p => p.dichiarato && p.dentro === null)
      });
      fatti++;
    }

    if (avanti) avanti(cartelle.length, cartelle.length, '');
    return fuori;
  }

  /* ── leggere e scrivere un file ──────────────────────────────────────── */
  /* Il percorso è sempre intero e relativo alla radice — `sol-y-mar/sito/
     consegna.md` — perché le caselle non stanno solo nei `prossimi-passi.md`:
     stanno nei file che ci sono già, a qualunque profondità. */

  async function cartellaDi(pezzi, creando){
    if (!radice) return null;
    let d = radice;
    for (const p of pezzi) d = await d.getDirectoryHandle(p, { create: !!creando });
    return d;
  }

  async function leggi(percorso){
    const pezzi = percorso.split('/').filter(Boolean);
    const file = pezzi.pop();
    try{
      const d = await cartellaDi(pezzi, false);
      return await (await (await d.getFileHandle(file)).getFile()).text();
    } catch (e){ return null; }
  }

  /* Come `scrivi`, ma crea anche le cartelle che mancano. Serve a una cosa
     sola: un'idea per un cliente che non hai ancora **non ha una cartella**, e
     se per scriverla dovessi prima aprire il Finder l'idea muore lì. */
  async function crea(percorso, testo){
    const pezzi = percorso.split('/').filter(Boolean);
    const file = pezzi.pop();
    const d = await cartellaDi(pezzi, true);
    if (!d) return false;
    const h = await d.getFileHandle(file, { create: true });
    const w = await h.createWritable();
    await w.write(testo);
    await w.close();
    return true;
  }

  async function scrivi(percorso, testo){
    const pezzi = percorso.split('/').filter(Boolean);
    const file = pezzi.pop();
    const d = await cartellaDi(pezzi, false);
    if (!d) return false;
    const h = await d.getFileHandle(file, { create: true });
    const w = await h.createWritable();
    await w.write(testo);
    await w.close();
    return true;
  }

  /* ── le caselle che stanno negli altri file ──────────────────────────── */
  /* `sol-y-mar/sito` ha diciassette cose da fare e nessun `prossimi-passi.md`:
     stanno in `consegna.md`, numerate e intrecciate alla prosa. Il conteggio
     che compare nell'elenco deve potersi aprire, o è un numero che promette
     una cosa che non c'è. */

  async function caselleAltrove(percorso, soloRadice){
    const pezzi = percorso.split('/').filter(Boolean);
    const dir = await cartellaDi(pezzi, false);
    if (!dir) return [];

    const fuori = [];
    let visti = 0;

    async function dentro(d, sotto, livello){
      if (visti >= FILE_MAX || livello > PROFONDITA_MAX) return;
      const cartelle = [];
      for await (const [n, h] of d.entries()){
        if (saltare(n)) continue;
        if (h.kind === 'directory'){ if (!soloRadice) cartelle.push([n, h]); continue; }
        if (!/\.md$/i.test(n) || n === FILE_PASSI) continue;
        if (++visti > FILE_MAX) return;
        try{
          const testo = await (await h.getFile()).text();
          const voci = [];
          let fatte = 0;
          testo.split('\n').forEach((riga, i) => {
            const m = riga.match(/^\s*-\s\[([ xX])\]\s?(.*)$/);
            if (!m) return;
            if (m[1] === ' ') voci.push({ riga: i, testo: m[2].trim() }); else fatte++;
          });
          /* Le fatte si contano ma non si elencano: qui dentro The Office non
             comanda, e una casella già spuntata in un file altrui non è una
             cosa su cui offrire un gesto. Il numero serve solo a tenere onesti
             i conti dell'elenco dopo una modifica. */
          if (voci.length || fatte) fuori.push({ file: (sotto ? sotto + '/' : '') + n, voci, fatte });
        } catch (e){ /* illeggibile: non è un errore, è un file in meno */ }
      }
      for (const [n, h] of cartelle) await dentro(h, (sotto ? sotto + '/' : '') + n, livello + 1);
    }

    await dentro(dir, '', 1);
    return fuori;
  }

  /* Serve alle prove, e a niente altro. Lo scandaglio è la parte che decide
     cos'è un progetto e da quanto tace: se si potesse provare solo collegando
     una cartella vera a mano, non si proverebbe mai. Con una maniglia finta
     montata sul disco, `prova-radice.js` gli fa attraversare `~/Lavori` intero
     e controlla i risultati contro le date lette da `find`. */
  function attacca(maniglia){ radice = maniglia; }

  return {
    possibile, collegata, nome, permesso, riprendi, collega, scollega,
    scandaglia, leggi, scrivi, crea, caselleAltrove,
    attacca, FILE_PASSI
  };
})();
