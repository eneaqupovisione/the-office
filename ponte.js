/* ═══════════════════════════════════════════════════════════════════════════
   IL PONTE — come le catture escono da qui e arrivano in `~/the-knowledge/_inbox`.

   Due strade, e nessuna delle due è la sincronizzazione vera:

   1. **La cartella collegata.** Sul computer: colleghi una volta la cartella
      `_inbox` e da lì in poi ogni cattura ci finisce dentro come file `.md`
      vero, da sola, senza gesti. È scrittura su disco locale, non rete: la
      decisione «nessuna chiamata di rete nel percorso del salvataggio» resta
      intatta. Vuole un contesto sicuro (`https` o `localhost`) e un browser
      basato su Chromium — su Safari iPhone non esiste.
   2. **L'esportazione.** Ovunque, telefono compreso, ma con un gesto tuo. Un
      file solo con dentro tutti i blocchi, perché i browser bloccano i
      download multipli.

   Il formato del file è quello di `METODO.md` §6, ed è **il metodo a comandare**:
   se un giorno i due divergono, si cambia questo file, non il metodo.
   ═══════════════════════════════════════════════════════════════════════ */

const Ponte = (() => {

  /* ── il formato dell'inbox (METODO §6) ───────────────────────────────── */
  function testa(r){
    const righe = ['---'];
    if (r.tipo) righe.push('tipo: ' + r.tipo);
    if (r.dove) righe.push('progetto: ' + r.dove);
    righe.push('origine: the-office');
    righe.push('stato: da-smistare');
    righe.push('---');
    return righe.join('\n');
  }

  function corpo(r){ return testa(r) + '\n\n' + r.testo + '\n'; }

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
    const pezzi = nomiUnici(righe).map(({ r, nome }) =>
      '=== _inbox/' + nome + '.md ===\n' + corpo(r));

    return '# Catture da The Office\n'
         + '# ' + righe.length + ' oggetti · esportati il '
         + new Date().toISOString().slice(0,16).replace('T',' ') + '\n'
         + '#\n'
         + '# Ogni blocco delimitato da tre segni di uguale è un file separato.\n'
         + '# Lo smistamento li spezza e li scrive in ~/the-knowledge/_inbox/.\n'
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

  async function nomeLibero(base){
    let nome = base + '.md', n = 1;
    /* eslint-disable no-constant-condition */
    while (true){
      try { await cartella.getFileHandle(nome); }
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
      const nome = await nomeLibero(r.nome);
      const f = await cartella.getFileHandle(nome, { create:true });
      const w = await f.createWritable();
      await w.write(corpo(r));
      await w.close();
      Dati.segnaUscite([r.id], 'cartella');
      return true;
    } catch (e) { return false; }
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

  return {
    corpo, componiEsportazione, scarica, nomiUnici,
    possibile, riprendi, collega, riprova, scollega, collegata, nomeCartella,
    scriviUna, scriviTutte
  };
})();
