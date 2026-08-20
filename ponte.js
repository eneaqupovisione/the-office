/* ═══════════════════════════════════════════════════════════════════════════
   IL PONTE — come le catture escono da qui e arrivano in `~/the-knowledge/_inbox`.

   Due strade, e nessuna delle due è la sincronizzazione vera:

   1. **La cartella collegata.** Sul computer: colleghi una volta
      `~/the-knowledge` e da lì in poi ogni cattura finisce in `_inbox/` come
      file `.md` vero, da sola, senza gesti. È scrittura su disco locale, non
      rete: la decisione «nessuna chiamata di rete nel percorso del salvataggio»
      resta intatta. Vuole un contesto sicuro (`https` o `localhost`) e un
      browser basato su Chromium — su Safari iPhone non esiste.

      **Si collega la radice dell'albero, non `_inbox`**, per una ragione che
      vale più della scrittura: da lì l'app può **leggere i progetti veri** —
      le cartelle dentro `prodotti/`, `clienti/`, `studio/`… — e proporli in
      cattura. È così che un lampo si attacca a un progetto che esiste davvero
      invece che a un nome scritto a mano. L'API dei file non permette di
      risalire alla cartella madre: se colleghi `_inbox` direttamente la
      scrittura funziona lo stesso, ma i progetti non si vedono.
   2. **La sincronizzazione.** Ovunque, telefono compreso, da sola. L'app manda
      la cattura al portiere (`netlify/functions/cattura.js`), che ha il token e
      scrive nel repo. Sta **dopo** il salvataggio locale e non lo blocca: se la
      rete non c'è, la cattura resta «in attesa» e riparte al prossimo giro.
   3. **L'esportazione.** Il ripiego che funziona sempre, anche senza niente
      configurato. Un file solo con dentro tutti i blocchi, perché i browser
      bloccano i download multipli.

   Il formato del `.md` che esce da qui lo costruisce `testa()`, qui sotto:
   frontmatter con `tipo` / `progetto` / `origine` / `stato` / `allegati`, riga
   vuota, poi il testo della cattura.
   ═══════════════════════════════════════════════════════════════════════ */

const Ponte = (() => {

  /* ── il formato del file in `_inbox/` ───────────────────────────────── */
  function testa(r, allegati){
    const righe = ['---'];
    if (r.tipo) righe.push('tipo: ' + r.tipo);
    if (r.dove) righe.push('progetto: ' + r.dove);
    righe.push('origine: the-office');
    righe.push('stato: da-smistare');
    /* Un allegato che il suo appunto non nomina è un file orfano dentro
       `media/`: la riga qui sotto è ciò che tiene insieme i due. */
    if (allegati && allegati.length)
      righe.push('allegati: ' + allegati.map(a => 'media/' + a.file).join(', '));
    righe.push('---');
    return righe.join('\n');
  }

  function corpo(r, allegati){ return testa(r, allegati) + '\n\n' + r.testo + '\n'; }

  /* Due lampi nello stesso minuto hanno lo stesso nome: il secondo prende un
     suffisso. Vale sia dentro un'esportazione sia dentro la cartella. */
  function nomiUnici(righe){
    const visti = {};
    return righe.map(r => {
      let nome = r.nome;
      visti[nome] = (visti[nome] || 0) + 1;
      if (visti[nome] > 1) nome += '-' + visti[nome];
      return { r, nome };
    });
  }

  /* ── strada 2 · l'esportazione ───────────────────────────────────────── */
  function componiEsportazione(righe){
    const pezzi = nomiUnici(righe).map(({ r, nome }) => {
      const casella = nomeCasella(r.dove);
      return '=== _inbox/' + (casella ? casella + '/' : '') + nome + '.md ===\n' + corpo(r);
    });

    return '# Catture da The Office\n'
         + '# ' + righe.length + ' oggetti · esportati il '
         + new Date().toISOString().slice(0,16).replace('T',' ') + '\n'
         + '#\n'
         + '# Ogni blocco delimitato da tre segni di uguale è un file separato.\n'
         + '# Lo smistamento li spezza e li scrive in ~/the-knowledge/_inbox/,\n'
         + '# ognuno nella casella del suo progetto, se ce l\'ha.\n'
         + '# (Qui sopra il separatore non è scritto per esteso di proposito:\n'
         + '#  comparirebbe come un blocco finto al primo che divide il file.)\n\n'
         + pezzi.join('\n');
  }

  function scarica(contenuto, nomeFile, tipoMime){
    const blob = new Blob([contenuto], { type: tipoMime });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = nomeFile;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  }

  /* ── strada 2 · la sincronizzazione ──────────────────────────────────────
     L'app non parla mai direttamente con GitHub: parla col portiere, che è
     l'unico a conoscere il token. Qui dentro non c'è nessun segreto — la
     chiave d'app la digita Enea una volta e vive solo su questo dispositivo,
     e serve a impedire che chiunque trovi l'indirizzo scriva nel suo albero. */
  const CHIAVE_LOCALE = 'the-office.chiave-app';
  const INDIRIZZO = '/.netlify/functions/cattura';

  const chiaveApp = () => localStorage.getItem(CHIAVE_LOCALE) || '';
  const impostaChiave = (v) => {
    v ? localStorage.setItem(CHIAVE_LOCALE, v.trim()) : localStorage.removeItem(CHIAVE_LOCALE);
  };
  /* Si sincronizza solo da dove l'app è servita davvero: da `file://` il
     portiere non esiste, e provarci darebbe un errore ogni salvataggio. */
  const sincronizzabile = () => location.protocol.startsWith('http') && !!chiaveApp();

  const inBase64 = (testo) =>
    btoa(String.fromCharCode(...new TextEncoder().encode(testo)));

  async function inviaAlPortiere(percorso, contenutoBase64){
    const r = await fetch(INDIRIZZO, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-chiave': chiaveApp() },
      body: JSON.stringify({ percorso, contenuto: contenutoBase64 })
    });
    if (!r.ok){
      let dettaglio = '';
      try { dettaglio = (await r.json()).errore || ''; } catch (e) {}
      const err = new Error(dettaglio || ('il portiere ha risposto ' + r.status));
      err.stato = r.status;
      throw err;
    }
    return r.json();
  }

  /* Il nome dentro `_inbox/`: la stessa casella per progetto della cartella
     collegata, così le due strade producono lo stesso albero. */
  const percorsoDi = (r, nome) => (nomeCasella(r.dove) ? nomeCasella(r.dove) + '/' : '') + nome + '.md';

  async function sincronizzaUna(r){
    if (!sincronizzabile()) return false;
    let allegati = [];
    try { if (typeof Media !== 'undefined') allegati = await Media.perCattura(r.id); }
    catch (e) { allegati = []; }

    /* Prima i file, poi la nota che li cita — come nella cartella collegata, e
       per la stessa ragione: meglio un file orfano che una nota bugiarda. */
    const scritti = [];
    for (const v of allegati){
      try{
        const nomeF = Media.nomeFile(v, r.nome);
        const casella = nomeCasella(r.dove);
        const dati = await v.dato.arrayBuffer();
        let bin = ''; const b = new Uint8Array(dati);
        for (let i = 0; i < b.length; i++) bin += String.fromCharCode(b[i]);
        await inviaAlPortiere((casella ? casella + '/' : '') + 'media/' + nomeF, btoa(bin));
        scritti.push({ file: nomeF });
        await Media.elimina(v.id);
      } catch (e) { /* resta in transito: la nota non lo cita */ }
    }

    let nome = r.nome, tentativi = 0;
    while (tentativi < 4){
      try{
        await inviaAlPortiere(percorsoDi(r, nome), inBase64(corpo(r, scritti)));
        Dati.segnaUscite([r.id], 'albero');
        return true;
      } catch (e){
        if (e.stato !== 409) throw e;          // solo il nome occupato si riprova
        tentativi += 1; nome = r.nome + '-' + (tentativi + 1);
      }
    }
    return false;
  }

  /* Tutte quelle che non sono ancora uscite. Si ferma al primo errore che non
     sia «nome occupato»: se la rete è giù, insistere venti volte non aiuta. */
  async function sincronizzaTutte(righe){
    let fatte = 0, errori = 0, motivo = '';
    for (const r of righe){
      try { (await sincronizzaUna(r)) ? fatte++ : errori++; }
      catch (e){ errori = righe.length - fatte; motivo = e.message || ''; break; }
    }
    return { fatte, errori, motivo };
  }

  /* ── strada 1 · la cartella collegata ────────────────────────────────────
     La maniglia della cartella sopravvive alla chiusura del browser solo se
     sta in IndexedDB: è l'unico magazzino che sappia serializzarla. */
  const DB = 'the-office-maniglie', DEPOSITO = 'maniglie', TASTO = 'inbox';
  let cartella = null;

  function apriDb(){
    return new Promise((ok, no) => {
      const req = indexedDB.open(DB, 1);
      req.onupgradeneeded = () => req.result.createObjectStore(DEPOSITO);
      req.onsuccess = () => ok(req.result);
      req.onerror = () => no(req.error);
    });
  }
  async function conservaManiglia(h){
    const db = await apriDb();
    return new Promise((ok, no) => {
      const t = db.transaction(DEPOSITO, 'readwrite');
      h ? t.objectStore(DEPOSITO).put(h, TASTO) : t.objectStore(DEPOSITO).delete(TASTO);
      t.oncomplete = ok; t.onerror = () => no(t.error);
    });
  }
  async function recuperaManiglia(){
    try{
      const db = await apriDb();
      return await new Promise((ok, no) => {
        const req = db.transaction(DEPOSITO, 'readonly').objectStore(DEPOSITO).get(TASTO);
        req.onsuccess = () => ok(req.result || null);
        req.onerror = () => no(req.error);
      });
    } catch (e) { return null; }
  }

  const possibile = () => typeof window.showDirectoryPicker === 'function';

  /* I domini dell'albero. Non è una lista di cartelle qualunque: sono i cinque
     di `~/the-knowledge`, e se cambiano lì cambiano anche qui. */
  const DOMINI = ['prodotti', 'clienti', 'studio', 'pratico', 'personale'];

  /* Dove si scrive davvero. Se la cartella collegata è già `_inbox` si scrive
     lì; altrimenti è la radice dell'albero e `_inbox` sta dentro. */
  async function cartellaInbox(){
    if (!cartella) return null;
    if (cartella.name === '_inbox') return cartella;
    return await cartella.getDirectoryHandle('_inbox', { create:true });
  }

  /* ── la casella del progetto ─────────────────────────────────────────────
     Una cattura con un'appartenenza atterra in `_inbox/<progetto>/`, non nel
     mucchio. **Resta `da-smistare`**: la sottocartella divide, non promuove.

     Il vantaggio non è l'ordine per l'ordine: è che la **radice** di `_inbox/`
     diventa da sola l'elenco di ciò che non ha ancora un'appartenenza, e che
     uno smistamento si può restringere a un progetto solo. */
  function nomeCasella(dove){
    return (dove || '').trim().toLowerCase()
      .replace(/[^a-z0-9._-]+/g, '-')      // niente barre: una casella, non un percorso
      .replace(/^-+|-+$/g, '').slice(0, 60);
  }

  async function cartellaScrittura(r){
    const inbox = await cartellaInbox();
    if (!inbox) return null;
    const casella = nomeCasella(r && r.dove);
    if (!casella) return inbox;             // senza progetto resta in cima
    try { return await inbox.getDirectoryHandle(casella, { create:true }); }
    catch (e) { return inbox; }             // se il nome non è valido, meglio la radice
  }

  /* I progetti veri, letti dall'albero. Solo cartelle, niente file e niente
     nomi che iniziano per punto o underscore — `_inbox` non è un progetto. */
  async function progettiVeri(){
    if (!cartella || cartella.name === '_inbox') return null;
    const trovati = [];
    for (const dominio of DOMINI){
      let dir;
      try { dir = await cartella.getDirectoryHandle(dominio); }
      catch (e) { continue; }                   // il dominio può non esistere
      for await (const [nome, h] of dir.entries()){
        if (h.kind !== 'directory') continue;
        if (nome.startsWith('.') || nome.startsWith('_')) continue;
        trovati.push({ nome, dominio, forma: await formaDi(h) });
      }
    }
    return trovati;
  }

  /* Che oggetto è un progetto, letto dal campo `forma:` nel frontmatter del suo
     `README.md`. Non lo si indovina dal nome né dalla cartella: se il file non lo
     dichiara, il progetto non ha forma — ed è un'informazione, non un errore. */
  async function formaDi(dirProgetto){
    try{
      const f = await dirProgetto.getFileHandle('README.md');
      const testa = (await (await f.getFile()).text()).slice(0, 600);
      const m = testa.match(/^forma:\s*([a-z-]+)/m);
      return m ? m[1] : '';
    } catch (e) { return ''; }
  }

  /* Al riavvio la maniglia c'è ma il permesso può essere scaduto. Non lo si
     richiede qui: `requestPermission` vuole un gesto dell'utente, e chiederlo
     all'apertura significherebbe un pannello davanti al lampo. */
  async function riprendi(){
    if (!possibile()) return null;
    const h = await recuperaManiglia();
    if (!h) return null;
    const p = await h.queryPermission({ mode:'readwrite' });
    cartella = (p === 'granted') ? h : null;
    return { maniglia:h, permesso:p };
  }

  async function collega(){
    if (!possibile()) throw new Error('non-possibile');
    const h = await window.showDirectoryPicker({ id:'inbox', mode:'readwrite', startIn:'documents' });
    const p = await h.requestPermission({ mode:'readwrite' });
    if (p !== 'granted') throw new Error('permesso-negato');
    cartella = h;
    await conservaManiglia(h);
    return h;
  }

  async function riprova(){
    const h = await recuperaManiglia();
    if (!h) return false;
    const p = await h.requestPermission({ mode:'readwrite' });
    if (p !== 'granted') return false;
    cartella = h; return true;
  }

  async function scollega(){ cartella = null; await conservaManiglia(null); }

  const collegata = () => !!cartella;
  const nomeCartella = () => cartella ? cartella.name : '';

  async function nomeLibero(dir, base){
    let nome = base + '.md', n = 1;
    /* eslint-disable no-constant-condition */
    while (true){
      try { await dir.getFileHandle(nome); }
      catch (e) { return nome; }        // non esiste: è libero
      n += 1; nome = base + '-' + n + '.md';
      if (n > 50) return base + '-' + Date.now() + '.md';
    }
  }

  /* Scrive **una** cattura. Chiamata subito dopo il salvataggio locale, e mai
     prima: se questa fallisce, la cattura è già al sicuro. */
  async function scriviUna(r){
    if (!cartella) return false;
    try{
      const dir = await cartellaScrittura(r);
      const nome = await nomeLibero(dir, r.nome);

      /* Prima i file, poi l'appunto che li nomina: se qualcosa va storto a
         metà, restano dei file senza nota (rumore) invece di una nota che
         promette file che non esistono (bugia). */
      const scritti = await scriviAllegati(dir, r);

      const f = await dir.getFileHandle(nome, { create:true });
      const w = await f.createWritable();
      await w.write(corpo(r, scritti));
      await w.close();
      Dati.segnaUscite([r.id], 'cartella');
      return true;
    } catch (e) { return false; }
  }

  /* Gli allegati vanno in `_inbox/media/`, e la riga `allegati:` del frontmatter
     è ciò che li tiene legati alla loro nota. Escono da IndexedDB e non ci
     tornano: da quel momento il file vive su disco. */
  async function scriviAllegati(dir, r){
    if (typeof Media === 'undefined') return [];
    let allegati = [];
    try { allegati = await Media.perCattura(r.id); } catch (e) { return []; }
    if (!allegati.length) return [];

    const media = await dir.getDirectoryHandle('media', { create:true });
    const scritti = [];
    for (const v of allegati){
      try{
        const nomeF = Media.nomeFile(v, r.nome);
        const fh = await media.getFileHandle(nomeF, { create:true });
        const w = await fh.createWritable();
        await w.write(v.dato);
        await w.close();
        scritti.push({ file: nomeF, id: v.id });
        await Media.elimina(v.id);
      } catch (e) { /* questo allegato resta in attesa, la nota non lo cita */ }
    }
    return scritti;
  }

  async function scriviTutte(righe){
    if (!cartella) return { scritte:0, errori: righe.length };
    let scritte = 0, errori = 0;
    for (const r of righe){
      const fatto = await scriviUna(r);
      fatto ? scritte++ : errori++;
    }
    return { scritte, errori };
  }

  /* ── leggere e scrivere nell'albero ──────────────────────────────────────
     Fin qui il ponte sapeva solo **depositare** in `_inbox/`. Commissioni e
     acquisti hanno bisogno dell'altra metà: aprire un file che esiste già,
     cambiarlo e riscriverlo. Vale solo con la **radice** collegata — da
     `_inbox` non si risale, e queste funzioni restituiscono `null` invece di
     fingere. */
  function pezzi(percorso){
    return String(percorso || '').split('/').filter(Boolean);
  }

  async function dirDa(parti, crea){
    let d = cartella;
    for (const nome of parti) d = await d.getDirectoryHandle(nome, { create: !!crea });
    return d;
  }

  /* `null` = non leggibile (albero non collegato, o file inesistente). Chi
     chiama distingue i due casi con `vedeLAlbero()`. */
  async function leggiTesto(percorso){
    if (!cartella || cartella.name === '_inbox') return null;
    const parti = pezzi(percorso);
    const nomeFile = parti.pop();
    try{
      const d = await dirDa(parti, false);
      const f = await d.getFileHandle(nomeFile);
      return await (await f.getFile()).text();
    } catch (e) { return null; }
  }

  async function scriviTesto(percorso, testo){
    if (!cartella || cartella.name === '_inbox') return false;
    const parti = pezzi(percorso);
    const nomeFile = parti.pop();
    try{
      const d = await dirDa(parti, true);
      const f = await d.getFileHandle(nomeFile, { create:true });
      const w = await f.createWritable();
      await w.write(testo);
      await w.close();
      return true;
    } catch (e) { return false; }
  }

  /* I nomi delle cartelle dentro un dominio (`clienti`, `prodotti`, …). Serve
     a Commissioni, che è la vista su `clienti/`. */
  async function cartelleIn(dominio){
    if (!cartella || cartella.name === '_inbox') return null;
    try{
      const d = await cartella.getDirectoryHandle(dominio);
      const nomi = [];
      for await (const [nome, h] of d.entries()){
        if (h.kind !== 'directory') continue;
        if (nome.startsWith('.') || nome.startsWith('_')) continue;
        nomi.push(nome);
      }
      return nomi.sort();
    } catch (e) { return []; }
  }

  return {
    corpo, componiEsportazione, scarica, nomiUnici,
    possibile, riprendi, collega, riprova, scollega, collegata, nomeCartella,
    scriviUna, scriviTutte, progettiVeri,
    chiaveApp, impostaChiave, sincronizzabile, sincronizzaUna, sincronizzaTutte,
    vedeLAlbero: () => !!cartella && cartella.name !== '_inbox',
    leggiTesto, scriviTesto, cartelleIn
  };
})();
