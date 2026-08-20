/* ═══════════════════════════════════════════════════════════════════════════
   I LAVORI — commissioni e acquisti, cioè le due sezioni che **non catturano**:
   leggono file che esistono già nell'albero, li cambiano e li riscrivono.

   Un motore solo per tutte e due, perché sono la stessa cosa: righe
   `- [ ] qualcosa` dentro un `.md`. Le commissioni stanno in
   `clienti/<nome>/prossimi-passi.md`, gli acquisti in `personale/acquisti.md`.

   **Non riorganizza mai il file.** Spuntare cambia un solo carattere della sua
   riga; aggiungere inserisce una riga sola. Tutto il resto — titoli, prosa,
   tabelle — resta dov'è e come è. Un file di lavoro vero ha dentro molto più
   delle caselle, e riscriverlo per intero sarebbe il modo più veloce di
   perdere qualcosa.

   Vuole la **radice** dell'albero collegata (Impostazioni → Collega la
   cartella). Senza, ogni funzione restituisce `null` e l'interfaccia lo dice.
   ═══════════════════════════════════════════════════════════════════════ */

const Lavori = (() => {

  const DOMINIO_COMMISSIONI = 'clienti';
  const FILE_COMMISSIONE    = 'prossimi-passi.md';
  const FILE_ACQUISTI       = 'personale/acquisti.md';

  const CASELLA = /^(\s*)-\s\[([ xX])\]\s?(.*)$/;

  /* ── il formato, letto ───────────────────────────────────────────────── */
  function voci(md){
    if (typeof md !== 'string') return [];
    const righe = md.split('\n');
    const fuori = [];
    let sezione = '';
    righe.forEach((riga, i) => {
      const t = riga.match(/^#{1,6}\s+(.*)$/);
      if (t){ sezione = t[1].trim(); return; }
      const m = riga.match(CASELLA);
      if (!m) return;
      fuori.push({
        riga: i,
        fatto: m[2].toLowerCase() === 'x',
        testo: m[3].trim(),
        sezione
      });
    });
    return fuori;
  }

  const conta = (v) => ({ fatte: v.filter(x => x.fatto).length, totali: v.length });

  /* ── il formato, scritto ─────────────────────────────────────────────── */
  function spunta(md, numeroRiga, fatto){
    const righe = md.split('\n');
    const m = (righe[numeroRiga] || '').match(CASELLA);
    if (!m) return md;                       // la riga è cambiata sotto i piedi
    righe[numeroRiga] = m[1] + '- [' + (fatto ? 'x' : ' ') + '] ' + m[3];
    return righe.join('\n');
  }

  function rinomina(md, numeroRiga, testo){
    const righe = md.split('\n');
    const m = (righe[numeroRiga] || '').match(CASELLA);
    if (!m) return md;
    righe[numeroRiga] = m[1] + '- [' + m[2] + '] ' + testo.trim();
    return righe.join('\n');
  }

  function elimina(md, numeroRiga){
    const righe = md.split('\n');
    if (!(righe[numeroRiga] || '').match(CASELLA)) return md;
    righe.splice(numeroRiga, 1);
    return righe.join('\n');
  }

  /* Una voce nuova entra **sotto l'ultima casella non fatta** della sezione
     scelta: è il posto dove la troverebbe chi legge il file a mano. Se la
     sezione non c'è, la crea in fondo. */
  function aggiungi(md, testo, sezione){
    const pulito = (testo || '').trim();
    if (!pulito) return md;
    const nuova = '- [ ] ' + pulito;
    const righe = (md || '').split('\n');

    let inizio = -1, fine = righe.length;
    if (sezione){
      for (let i = 0; i < righe.length; i++){
        const t = righe[i].match(/^(#{1,6})\s+(.*)$/);
        if (!t) continue;
        if (inizio === -1 && t[2].trim().toLowerCase() === sezione.toLowerCase()){ inizio = i; continue; }
        if (inizio !== -1){ fine = i; break; }
      }
      if (inizio === -1){                    // sezione assente: la creo in fondo
        const coda = righe.length && righe[righe.length-1].trim() ? ['', ''] : [''];
        return righe.concat(coda, ['## ' + sezione, '', nuova, '']).join('\n');
      }
    }

    let dove = -1;
    for (let i = (inizio === -1 ? 0 : inizio + 1); i < fine; i++){
      if (righe[i].match(CASELLA)) dove = i;
    }
    if (dove === -1){                        // sezione senza caselle: subito sotto il titolo
      dove = inizio === -1 ? righe.length - 1 : inizio;
      if (inizio !== -1 && !(righe[dove+1] || '').trim()) dove += 1;
    }
    righe.splice(dove + 1, 0, nuova);
    return righe.join('\n');
  }

  /* ── commissioni ─────────────────────────────────────────────────────── */
  const percorsoCommissione = (nome) =>
    DOMINIO_COMMISSIONI + '/' + nome + '/' + FILE_COMMISSIONE;

  const intestazione = (nome) =>
    '# ' + nome + '\n\n'
    + 'Le cose da fare per questa commissione. Le caselle le muove The Office;\n'
    + 'il resto del file è tuo.\n\n'
    + '## Da fare\n\n'
    + '## Fatte\n';

  async function elenco(){
    const nomi = await Ponte.cartelleIn(DOMINIO_COMMISSIONI);
    if (nomi === null) return null;             // albero non collegato
    const fuori = [];
    for (const nome of nomi){
      const md = await Ponte.leggiTesto(percorsoCommissione(nome));
      const v = md === null ? [] : voci(md);
      fuori.push(Object.assign({
        nome,
        percorso: percorsoCommissione(nome),
        esiste: md !== null,
        stato: await statoDi(nome),
        voci: v
      }, conta(v)));
    }
    return fuori;
  }

  /* `stato:` dal frontmatter del README della commissione — attivo, in-pausa,
     finito. Se il file non lo dichiara resta vuoto: è un'informazione. */
  async function statoDi(nome){
    const md = await Ponte.leggiTesto(DOMINIO_COMMISSIONI + '/' + nome + '/README.md');
    if (!md) return '';
    const m = md.slice(0, 600).match(/^stato:\s*([a-z-]+)/m);
    return m ? m[1] : '';
  }

  /* Ogni scrittura rilegge il file un istante prima: se nel frattempo l'hai
     toccato da Claude Code, si lavora sulla versione vera e non su quella che
     l'interfaccia aveva in mano. */
  async function cambia(percorso, trasforma, seManca){
    let md = await Ponte.leggiTesto(percorso);
    if (md === null){
      if (seManca === undefined) return false;
      md = seManca;
    }
    const nuovo = trasforma(md);
    if (nuovo === md) return true;              // niente da scrivere
    return await Ponte.scriviTesto(percorso, nuovo);
  }

  const spuntaCommissione = (nome, riga, fatto) =>
    cambia(percorsoCommissione(nome), (md) => spunta(md, riga, fatto));

  const rinominaCommissione = (nome, riga, testo) =>
    cambia(percorsoCommissione(nome), (md) => rinomina(md, riga, testo));

  const eliminaCommissione = (nome, riga) =>
    cambia(percorsoCommissione(nome), (md) => elimina(md, riga));

  const aggiungiACommissione = (nome, testo) =>
    cambia(percorsoCommissione(nome), (md) => aggiungi(md, testo, 'Da fare'), intestazione(nome));

  /* ── acquisti ────────────────────────────────────────────────────────── */
  const ACQUISTI_VUOTO =
    '# Acquisti\n\n'
    + 'Le caselle le muove The Office; il resto del file è tuo.\n\n'
    + '## Da comprare\n\n'
    + '## In corso\n\n'
    + '## Presi\n';

  async function acquisti(){
    const md = await Ponte.leggiTesto(FILE_ACQUISTI);
    if (md === null && !Ponte.vedeLAlbero()) return null;
    const v = voci(md || ACQUISTI_VUOTO);
    return Object.assign({ esiste: md !== null, voci: v }, conta(v));
  }

  const spuntaAcquisto = (riga, fatto) =>
    cambia(FILE_ACQUISTI, (md) => spunta(md, riga, fatto), ACQUISTI_VUOTO);

  const rinominaAcquisto = (riga, testo) =>
    cambia(FILE_ACQUISTI, (md) => rinomina(md, riga, testo), ACQUISTI_VUOTO);

  const eliminaAcquisto = (riga) =>
    cambia(FILE_ACQUISTI, (md) => elimina(md, riga), ACQUISTI_VUOTO);

  const aggiungiAcquisto = (testo, sezione) =>
    cambia(FILE_ACQUISTI, (md) => aggiungi(md, testo, sezione || 'Da comprare'), ACQUISTI_VUOTO);

  return {
    voci, conta, spunta, rinomina, elimina, aggiungi,   // il motore, provabile da solo
    SEZIONI_ACQUISTI: ['Da comprare', 'In corso', 'Presi'],
    elenco, spuntaCommissione, rinominaCommissione, eliminaCommissione, aggiungiACommissione,
    acquisti, spuntaAcquisto, rinominaAcquisto, eliminaAcquisto, aggiungiAcquisto
  };
})();
