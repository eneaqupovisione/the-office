/* ═══════════════════════════════════════════════════════════════════════════
   GLI ALLEGATI — foto, audio, file, per i tipi che senza non dicono niente.
   Un `riferimento` è spesso una foto; un'`idea` a volte è una nota vocale.

   **Perché non stanno in `localStorage` come il testo.** Una foto da 3 MB in
   base64 ne diventa 4, e la quota totale è circa 5: un allegato solo
   ucciderebbe il magazzino, cioè la cattura. Stanno in IndexedDB, che i dati
   binari li tiene per quello che sono e non ha quel tetto.

   **Perché l'app li tiene, se «non deve possedere file binari»** (decisione del
   2026-08-11). Perché non li possiede: li tiene **in transito**, esattamente
   come tiene il testo, finché non escono da una delle due strade. La differenza
   fra un magazzino di transito e una libreria è che dal primo le cose escono —
   e il contatore serve a vedere che escano davvero.

   L'allegato **non sostituisce mai il testo**: il testo resta l'unica cosa
   necessaria per salvare. È anche ciò che rende una cattura con allegato
   cercabile — nell'albero si cerca il pensiero, non il pixel.
   ═══════════════════════════════════════════════════════════════════════ */

const Media = (() => {

  const DB = 'the-office-media', DEPOSITO = 'allegati';
  const TETTO = 25 * 1024 * 1024;      // per allegato: oltre, è un file, non un lampo

  function apri(){
    return new Promise((ok, no) => {
      const req = indexedDB.open(DB, 1);
      req.onupgradeneeded = () => {
        const d = req.result.createObjectStore(DEPOSITO, { keyPath:'id' });
        d.createIndex('cattura', 'cattura');
      };
      req.onsuccess = () => ok(req.result);
      req.onerror = () => no(req.error);
    });
  }

  function transazione(modo, fn){
    return apri().then(db => new Promise((ok, no) => {
      const t = db.transaction(DEPOSITO, modo);
      const richiesta = fn(t.objectStore(DEPOSITO));
      t.oncomplete = () => ok(richiesta && richiesta.result);
      t.onerror = () => no(t.error);
    }));
  }

  const estensione = (nome, tipo) => {
    const p = (nome || '').split('.').pop();
    if (p && p.length <= 5 && p !== nome) return p.toLowerCase();
    return (tipo || '').split('/')[1] || 'bin';
  };

  /* Aggiunge un file, ancora senza cattura: al momento della scelta la cattura
     non esiste. `assegna()` li lega dopo il salvataggio. */
  async function aggiungi(file){
    if (!file) return null;
    if (file.size > TETTO) throw new Error('troppo grande (max 25 MB)');
    const v = {
      id: Date.now() + '-' + Math.random().toString(36).slice(2,7),
      cattura: '',
      nome: file.name || 'allegato',
      tipo: file.type || 'application/octet-stream',
      peso: file.size,
      quando: new Date().toISOString(),
      dato: file
    };
    await transazione('readwrite', d => d.put(v));
    return v;
  }

  async function assegna(ids, catturaId){
    for (const id of ids){
      const v = await transazione('readonly', d => d.get(id));
      if (!v) continue;
      v.cattura = catturaId;
      await transazione('readwrite', d => d.put(v));
    }
  }

  async function perCattura(catturaId){
    const tutti = await transazione('readonly', d => d.getAll());
    return (tutti || []).filter(v => v.cattura === catturaId);
  }

  async function elimina(id){ await transazione('readwrite', d => d.delete(id)); }

  async function tutti(){ return (await transazione('readonly', d => d.getAll())) || []; }

  /* Il nome che avrà nel `media/` dell'albero: la stessa data del file della
     cattura, così i due si ritrovano guardandoli. */
  const nomeFile = (v, base) => base + '-' + v.id.slice(-5) + '.' + estensione(v.nome, v.tipo);

  function peso(n){
    if (n < 1024) return n + ' B';
    if (n < 1024*1024) return Math.round(n/1024) + ' KB';
    return (n/1024/1024).toFixed(1).replace('.0','') + ' MB';
  }

  return { aggiungi, assegna, perCattura, elimina, tutti, nomeFile, peso };
})();
