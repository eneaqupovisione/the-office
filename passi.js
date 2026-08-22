/* ═══════════════════════════════════════════════════════════════════════════
   I PASSI — il formato di `prossimi-passi.md`, letto e scritto.

   Un file per progetto, e dentro ci stanno le quattro cose che servono a
   riprendere in mano un lavoro dopo tre mesi:

       # nome del progetto

       > perché esiste — una frase sola

       ## Belle idee
       - il menu che cambia con l'ora

       ## Da fare
       - [ ] la prossima mossa

       ## Fatte
       - [x] 2026-08-21 · quello che avevi già fatto

   ## Perché un file solo e non due

   Il perché e le belle idee stanno **in cima ai prossimi passi** e non in un
   file a parte, perché il momento in cui ti servono è esattamente il momento
   in cui apri questo: torni su un progetto, e la prima cosa che leggi è
   perché ti piaceva. Se un giorno la sezione delle idee diventa un archivio,
   si spacca in due — ma nasce leggera, come tutto.

   ## Le fatte scendono, non spariscono

   Spuntare **non cancella**: la riga scende sotto `## Fatte` con la sua data.
   In tutta `~/Lavori` le caselle spuntate erano diciassette, tutte in un
   progetto solo, ed erano l'unica traccia di avanzamento esistente sul disco.
   Sono anche l'unica cosa che, tornando dopo mesi, ti dice *quanto avevi già
   fatto* — che è metà della risposta al «non sono stimolato a continuarlo».
   Toglierle sarebbe smontare la risposta.

   Le più recenti stanno in cima alla sezione: quello che hai appena finito è
   quello che vuoi vedere.

   ## Due regole che non si toccano

   1. **Non si riscrive mai il file intero.** Ogni operazione tocca una riga:
      la cambia, la toglie, la rimette altrove. Prosa, titoli e tabelle che ci
      hai scritto dentro restano dove sono.
   2. **Se le sezioni non ci sono, valgono lo stesso tutte le caselle del
      file.** The Office deve saper leggere un `prossimi-passi.md` scritto a
      mano prima che esistesse, non solo quelli che ha creato lui.
   ═══════════════════════════════════════════════════════════════════════ */

const Passi = (() => {

  const CASELLA  = /^(\s*)-\s\[([ xX])\]\s?(.*)$/;
  const PUNTO    = /^(\s*)-\s(?!\[)\s*(.*)$/;      // un elenco senza casella: un'idea
  const TITOLO   = /^(#{1,6})\s+(.*)$/;
  const DATATA   = /^(\d{4}-\d{2}-\d{2})\s+·\s+(.*)$/;

  const DA_FARE = 'Da fare', FATTE = 'Fatte', IDEE = 'Belle idee';

  /* ── i tre campi in cima, e perché sono solo tre ─────────────────────────

     `entro:` è l'**unica** cosa che genera pressione. Non c'è un campo per il
     tipo di progetto, e non ci sarà: commissione o demo cambia la conseguenza
     nel mondo, non cosa fa il programma — una data è una data. Una categoria
     da tenere aggiornata a mano è solo una cosa in più da sbagliare.

         in corsa   `entro` c'è ed è futuro
         scaduta    `entro` c'è ed è passato → l'app fa una domanda, non una multa
         libero     `entro` non c'è
         chiuso     `chiuso` c'è

     `per:` dice chi aspetta, ed è facoltativo — serve a far diventare reale una
     demo (un destinatario e una data, se no è un desiderio) e un giorno a
     legare fra loro i progetti fatti per la stessa persona.

     `chiuso:` è una data e non un sì/no, così sai anche **quando** hai deciso.

     Stanno in front matter, in cima: si vedono aprendo il `.md` in qualunque
     editor, non si mescolano alla prosa, e si scrivono sia dall'app sia da
     Claude Code — che è il punto, perché la revisione si fa nei due modi. */

  /* `colore` è il quarto, ed è l'unico che non dice niente sul lavoro: dice
     come riconoscerlo. Sta qui e non nell'app perché una tinta scelta e poi
     persa svuotando il browser sarebbe peggio di una tinta non scelta. */
  const CAMPI = ['per', 'entro', 'chiuso', 'colore'];

  function frontMatter(righe){
    if ((righe[0] || '').trim() !== '---') return null;
    for (let i = 1; i < righe.length; i++)
      if (righe[i].trim() === '---') return { inizio: 0, fine: i };
    return null;                                   // aperto e mai chiuso: non è front matter
  }

  function campi(md){
    const righe = (md || '').split('\n');
    const fm = frontMatter(righe);
    const fuori = {};
    if (!fm) return fuori;
    for (let i = fm.inizio + 1; i < fm.fine; i++){
      const m = righe[i].match(/^([A-Za-zÀ-ÿ_-]+)\s*:\s*(.*)$/);
      if (m) fuori[m[1].toLowerCase()] = m[2].trim();
    }
    return fuori;
  }

  /* Valore vuoto toglie la chiave; tolta l'ultima, sparisce anche il blocco —
     un front matter vuoto in cima a un file è rumore. */
  function scriviCampo(md, chiave, valore){
    const righe = (md || '').split('\n');
    const fm = frontMatter(righe);
    const pulito = (valore || '').trim();
    const riga = chiave + ': ' + pulito;

    if (!fm){
      if (!pulito) return md;
      return ['---', riga, '---', ''].concat(righe).join('\n');
    }

    let dove = -1;
    for (let i = fm.inizio + 1; i < fm.fine; i++){
      const m = righe[i].match(/^([A-Za-zÀ-ÿ_-]+)\s*:/);
      if (m && m[1].toLowerCase() === chiave){ dove = i; break; }
    }

    if (pulito){
      if (dove !== -1) righe[dove] = riga;
      else righe.splice(fm.fine, 0, riga);         // in fondo al blocco
      return righe.join('\n');
    }

    if (dove === -1) return md;
    righe.splice(dove, 1);
    /* Se era l'ultima, via anche i due `---`. */
    if (fm.fine - fm.inizio === 2) righe.splice(fm.inizio, 2);
    return righe.join('\n');
  }

  /* Quanto manca, detto come lo diresti a voce. Il negativo è scaduto. */
  function scadenza(entro, adesso){
    if (!entro || !/^\d{4}-\d{2}-\d{2}$/.test(entro)) return null;
    const g = Math.round((new Date(entro + 'T12:00:00') - (adesso || new Date())) / 86400000);
    const testo = g === 0 ? 'oggi'
                : g === 1 ? 'domani'
                : g === -1 ? 'ieri'
                : g > 0 ? 'fra ' + g + ' giorni'
                : 'scaduta da ' + (-g) + ' giorni';
    return { giorni: g, scaduta: g < 0, testo };
  }

  const oggi = () => {
    const d = new Date(), due = (n) => String(n).padStart(2, '0');
    return d.getFullYear() + '-' + due(d.getMonth() + 1) + '-' + due(d.getDate());
  };

  const stessa = (a, b) => (a || '').trim().toLowerCase() === b.toLowerCase();

  /* Dove comincia e dove finisce una sezione. `fine` è la riga del titolo
     successivo, o la fine del file. */
  function sezione(righe, titolo){
    let inizio = -1;
    for (let i = 0; i < righe.length; i++){
      const t = righe[i].match(TITOLO);
      if (!t) continue;
      if (inizio === -1){ if (stessa(t[2], titolo)) inizio = i; continue; }
      return { inizio, fine: i };
    }
    return inizio === -1 ? null : { inizio, fine: righe.length };
  }

  /* ── letto ───────────────────────────────────────────────────────────── */

  function leggi(md){
    const righe = (md || '').split('\n');
    const c = campi(md);

    /* Il perché: la prima citazione del file. È la forma che usa già Enea nei
       suoi `.md`, e si distingue a occhio dal resto senza bisogno di un campo. */
    let perche = '';
    for (const r of righe){
      const m = r.match(/^>\s?(.*)$/);
      if (m && m[1].trim()){ perche = m[1].trim(); break; }
      if (r.match(TITOLO) && perche) break;
    }

    const secIdee = sezione(righe, IDEE);
    const secFare = sezione(righe, DA_FARE);
    const secFatte = sezione(righe, FATTE);

    const dentro = (sec, i) => sec && i > sec.inizio && i < sec.fine;

    const idee = [], daFare = [], fatte = [];

    righe.forEach((riga, i) => {
      const c = riga.match(CASELLA);
      if (c){
        const voce = { riga: i, testo: c[3].trim() };
        if (c[2].toLowerCase() === 'x'){
          const d = voce.testo.match(DATATA);
          if (d){ voce.data = d[1]; voce.testo = d[2]; }
          fatte.push(voce);
        } else {
          /* Una casella non spuntata è da fare **ovunque stia**: se le sezioni
             non ci sono, il file funziona lo stesso. */
          if (!secFatte || !dentro(secFatte, i)) daFare.push(voce);
        }
        return;
      }
      const p = riga.match(PUNTO);
      if (p && dentro(secIdee, i) && p[2].trim()) idee.push({ riga: i, testo: p[2].trim() });
    });

    return {
      perche, idee, daFare, fatte,
      per: c.per || '', entro: c.entro || '', chiuso: c.chiuso || '', colore: c.colore || '',
      haSezioni: !!(secFare || secFatte),
      /* Le caselle fuori da `## Da fare` vengono da file che The Office non ha
         scritto — `consegna.md`, gli handoff. Vanno spuntate sul posto, senza
         spostare una riga, e chi disegna deve poterlo sapere. */
      sezioneDi: (i) => dentro(secFare, i) ? DA_FARE
                      : dentro(secFatte, i) ? FATTE
                      : dentro(secIdee, i) ? IDEE : ''
    };
  }

  /* ── scritto: sempre una riga alla volta ─────────────────────────────── */

  function nuovo(nome, perche){
    return '# ' + nome + '\n\n'
      + '> ' + (perche && perche.trim() ? perche.trim() : 'perché esiste — scrivilo adesso, che te lo ricordi') + '\n\n'
      + '## ' + IDEE + '\n\n'
      + '## ' + DA_FARE + '\n\n'
      + '## ' + FATTE + '\n';
  }

  function scriviPerche(md, testo){
    const righe = (md || '').split('\n');
    const pulito = (testo || '').trim();
    for (let i = 0; i < righe.length; i++){
      if (righe[i].match(/^>\s?(.*)$/)){
        if (!pulito){ righe.splice(i, 1); return righe.join('\n'); }
        righe[i] = '> ' + pulito;
        return righe.join('\n');
      }
      if (righe[i].match(TITOLO) && i > 0) break;
    }
    if (!pulito) return md;
    /* Non c'era: va sotto il titolo del file, che è il posto dove lo cercherebbe
       chi apre il `.md` a mano. */
    let dove = righe.findIndex(r => r.match(TITOLO));
    if (dove === -1) dove = -1;
    righe.splice(dove + 1, 0, '', '> ' + pulito);
    return righe.join('\n');
  }

  /* Una voce nuova entra **in fondo alla sua sezione**, dopo l'ultima riga
     piena: è il posto dove la metterebbe chi scrive il file a mano. Se la
     sezione non c'è, la crea in fondo al file. */
  function inserisci(md, titolo, riga, inCima){
    const righe = (md || '').split('\n');
    const sec = sezione(righe, titolo);

    if (!sec){
      const coda = righe.length && righe[righe.length - 1].trim() ? ['', ''] : [''];
      return righe.concat(coda, ['## ' + titolo, '', riga, '']).join('\n');
    }
    if (inCima){
      let dove = sec.inizio + 1;
      while (dove < sec.fine && !righe[dove].trim()) dove++;
      righe.splice(dove, 0, riga);
      return righe.join('\n');
    }
    let dove = sec.inizio;
    for (let i = sec.inizio + 1; i < sec.fine; i++) if (righe[i].trim()) dove = i;
    if (dove === sec.inizio) righe.splice(dove + 1, 0, '', riga);
    else righe.splice(dove + 1, 0, riga);
    return righe.join('\n');
  }

  const aggiungiPasso = (md, testo) =>
    (testo || '').trim() ? inserisci(md, DA_FARE, '- [ ] ' + testo.trim(), false) : md;

  const aggiungiIdea = (md, testo) =>
    (testo || '').trim() ? inserisci(md, IDEE, '- ' + testo.trim(), false) : md;

  /* ── la riga è ancora quella che credevi? ────────────────────────────── */
  /* Ogni scrittura rilegge il file un istante prima, perché Claude Code può
     averlo cambiato mentre l'app era aperta. Ma rileggere non basta: se nel
     frattempo una riga è stata aggiunta sopra, il numero di riga punta a
     un'altra casella e la spunteresti al posto giusto sbagliato.

     Quindi ogni operazione dice anche **che cosa si aspetta di trovare**, e se
     non lo trova non fa niente. Chi chiama vede il file immutato e ricarica. */

  function combacia(righe, i, atteso){
    if (atteso == null) return true;
    const r = righe[i] || '';
    const m = r.match(CASELLA) || r.match(PUNTO);
    if (!m) return false;
    let testo = (m[3] !== undefined ? m[3] : m[2]).trim();
    const d = testo.match(DATATA);
    if (d) testo = d[2];
    return testo === String(atteso).trim();
  }

  function rinomina(md, numeroRiga, testo, atteso){
    const righe = (md || '').split('\n');
    if (!combacia(righe, numeroRiga, atteso)) return md;
    const r = righe[numeroRiga] || '';
    const c = r.match(CASELLA);
    if (c){ righe[numeroRiga] = c[1] + '- [' + c[2] + '] ' + testo.trim(); return righe.join('\n'); }
    const p = r.match(PUNTO);
    if (p){ righe[numeroRiga] = p[1] + '- ' + testo.trim(); return righe.join('\n'); }
    return md;
  }

  function elimina(md, numeroRiga, atteso){
    const righe = (md || '').split('\n');
    if (!combacia(righe, numeroRiga, atteso)) return md;
    const r = righe[numeroRiga] || '';
    if (!r.match(CASELLA) && !r.match(PUNTO)) return md;
    righe.splice(numeroRiga, 1);
    return righe.join('\n');
  }

  /* Spuntare sul posto: cambia un carattere e basta. È quello che si fa sui
     file che The Office non possiede — `consegna.md` ha le caselle numerate e
     intrecciate alla prosa, e spostarle distruggerebbe il documento. */
  function spuntaSulPosto(md, numeroRiga, fatto, atteso){
    const righe = (md || '').split('\n');
    if (!combacia(righe, numeroRiga, atteso)) return md;
    const c = (righe[numeroRiga] || '').match(CASELLA);
    if (!c) return md;
    righe[numeroRiga] = c[1] + '- [' + (fatto ? 'x' : ' ') + '] ' + c[3];
    return righe.join('\n');
  }

  /* Spuntare in `prossimi-passi.md`: la riga scende sotto `## Fatte`, con la
     data, e le ultime finite stanno in cima. */
  function spunta(md, numeroRiga, atteso, quando){
    const righe = (md || '').split('\n');
    if (!combacia(righe, numeroRiga, atteso)) return md;
    const c = (righe[numeroRiga] || '').match(CASELLA);
    if (!c || c[2].toLowerCase() === 'x') return md;
    righe.splice(numeroRiga, 1);
    return inserisci(righe.join('\n'), FATTE, '- [x] ' + (quando || oggi()) + ' · ' + c[3].trim(), true);
  }

  /* E il ripensamento deve costare quanto lo spuntare, o non lo si usa. */
  function despunta(md, numeroRiga, atteso){
    const righe = (md || '').split('\n');
    if (!combacia(righe, numeroRiga, atteso)) return md;
    const c = (righe[numeroRiga] || '').match(CASELLA);
    if (!c || c[2].toLowerCase() !== 'x') return md;
    let testo = c[3].trim();
    const d = testo.match(DATATA);
    if (d) testo = d[2];
    righe.splice(numeroRiga, 1);
    return inserisci(righe.join('\n'), DA_FARE, '- [ ] ' + testo, false);
  }

  /* Un'idea che diventa una mossa: è il gesto per cui esiste la sezione delle
     idee. Torni su un progetto dopo mesi, rileggi cosa ti era venuto in mente,
     e ne scegli una da fare adesso. */
  function promuoviIdea(md, numeroRiga, atteso){
    const righe = (md || '').split('\n');
    if (!combacia(righe, numeroRiga, atteso)) return md;
    const p = (righe[numeroRiga] || '').match(PUNTO);
    if (!p || !p[2].trim()) return md;
    righe.splice(numeroRiga, 1);
    return inserisci(righe.join('\n'), DA_FARE, '- [ ] ' + p[2].trim(), false);
  }

  return {
    leggi, nuovo, scriviPerche,
    aggiungiPasso, aggiungiIdea, rinomina, elimina,
    spunta, despunta, spuntaSulPosto, promuoviIdea,
    campi, scriviCampo, scadenza,
    oggi, CAMPI, DA_FARE, FATTE, IDEE
  };
})();
