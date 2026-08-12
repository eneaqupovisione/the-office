/* ═══════════════════════════════════════════════════════════════════════════
   IL LAMPO — la schermata che si apre, e l'unica che conta davvero.

   Obiettivo unico: dal pensiero al testo salvato in meno di cinque secondi e
   **nessuna decisione obbligatoria** (METODO §1). Tutto ciò che sta qui sotto
   è facoltativo tranne il testo; se un giorno qualcosa diventasse obbligatorio,
   sarebbe una rottura del primo principio del metodo, non un dettaglio di
   interfaccia.
   ═══════════════════════════════════════════════════════════════════════ */

const Cattura = (() => {

  const $ = (id) => document.getElementById(id);
  const testo = $('testo'), dove = $('dove'), salva = $('salva');

  let tipoScelto = null;
  let formaScelta = null;
  let inAllegato = [];        // scelti e non ancora salvati

  /* ── la riga di stato del foglio ─────────────────────────────────────────
     Dice il nome che il file avrà in `_inbox/` e se è già uscito di qui: chi
     scrive sa dove sta andando quello che sta scrivendo, prima di salvarlo. */
  function aggiornaFinestra(stato){
    const vuoto = testo.value.trim() === '';
    $('nome-file').textContent = vuoto
      ? 'nuova cattura'
      : '_inbox/' + Dati.orario(new Date()) + '.md';
    $('stato-file').textContent = stato || (vuoto ? 'vuota' : 'non salvata');
  }

  /* ── che differenza c'è fra i tipi ───────────────────────────────────────
     Due modi di leggerlo, e nessuno dei due costa un gesto in più al lampo:
     la riga sotto la griglia spiega **il tipo scelto** mentre lo scegli, e
     «che differenza c'è?» apre l'elenco intero per quando lo stai imparando.
     La differenza vera fra due tipi non è la definizione: è **dove finiscono**
     dopo lo smistamento, e infatti è scritto lì accanto. */
  function disegnaSpiegazione(){
    const el = $('spiega-tipo');
    const t = Dati.TIPI.find(x => x.id === tipoScelto);
    if (!t){ el.textContent = ''; el.removeAttribute('data-tipo'); return; }
    el.dataset.tipo = t.id;
    el.innerHTML = '';
    const cosa = document.createElement('span');
    cosa.textContent = t.cosa;
    const dove = document.createElement('span');
    dove.className = 'spiega-dove';
    dove.textContent = '→ ' + t.dove;
    el.append(cosa, dove);
  }

  function disegnaLegenda(){
    const casa = $('legenda');
    casa.innerHTML = '';
    Dati.TIPI.forEach(t => {
      const r = document.createElement('div');
      r.className = 'voce-legenda';
      r.dataset.tipo = t.id;
      const n = document.createElement('span'); n.className = 'voce-legenda-nome'; n.textContent = t.id;
      const c = document.createElement('span'); c.className = 'voce-legenda-cosa'; c.textContent = t.cosa;
      const d = document.createElement('span'); d.className = 'voce-legenda-dove'; d.textContent = t.dove;
      r.append(n, c, d);
      casa.appendChild(r);
    });
    const nota = document.createElement('p');
    nota.className = 'nota-campo';
    nota.textContent = 'Sono i sei tipi di METODO.md §6, più contatto che è in prova. '
      + 'Sono pochi apposta: davanti a dodici pulsanti la scelta diventa l\'attrito che il sistema doveva togliere.';
    casa.appendChild(nota);
  }

  /* ── le caselle del tipo ───────────────────────────────────────────────
     Il tipo prima del progetto: nel momento del lampo so quasi sempre *che
     genere di cosa* è, non ancora dove va. */
  function disegnaTipi(){
    const casa = $('tipi');
    casa.innerHTML = '';
    Dati.TIPI.forEach(t => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'tipo' + (t.prova ? ' prova' : '');
      b.dataset.tipo = t.id;        // il colore del foglietto glielo dà il CSS
      b.textContent = t.id;
      b.title = t.cosa;
      b.setAttribute('aria-pressed', String(tipoScelto === t.id));
      b.addEventListener('click', () => {
        const gia = tipoScelto === t.id;
        casa.querySelectorAll('.tipo').forEach(x => x.setAttribute('aria-pressed','false'));
        tipoScelto = gia ? null : t.id;     // ritoccarlo lo toglie: niente è obbligatorio
        if (!gia) b.setAttribute('aria-pressed','true');
        disegnaSpiegazione();
        testo.focus();                       // il fuoco torna sempre al lampo                       // il fuoco torna sempre al lampo
      });
      casa.appendChild(b);
    });
  }

  /* ── gli allegati ────────────────────────────────────────────────────────
     Si scelgono prima di salvare e vengono legati alla cattura dopo, perché al
     momento della scelta la cattura non esiste ancora. Il testo resta l'unica
     cosa necessaria: un allegato da solo non salva niente. */
  function disegnaAllegati(){
    const casa = $('allegati');
    casa.innerHTML = '';
    casa.hidden = inAllegato.length === 0;
    inAllegato.forEach(v => {
      const el = document.createElement('span');
      el.className = 'allegato';
      const n = document.createElement('span');
      n.className = 'allegato-nome'; n.textContent = v.nome;
      const p = document.createElement('span');
      p.className = 'allegato-peso'; p.textContent = Media.peso(v.peso);
      const x = document.createElement('button');
      x.type = 'button'; x.className = 'allegato-togli'; x.textContent = '×';
      x.setAttribute('aria-label', 'Togli ' + v.nome);
      x.addEventListener('click', async () => {
        await Media.elimina(v.id);
        inAllegato = inAllegato.filter(a => a.id !== v.id);
        disegnaAllegati(); testo.focus();
      });
      el.append(n, p, x);
      casa.appendChild(el);
    });
  }

  async function scegliFile(e){
    const files = [...(e.target.files || [])];
    e.target.value = '';                       // così si può riscegliere lo stesso
    for (const f of files){
      try { inAllegato.push(await Media.aggiungi(f)); }
      catch (err) { App.conferma(f.name + ': ' + err.message, true); }
    }
    disegnaAllegati();
    testo.focus();
  }

  /* ── i due passi: che oggetto è, poi quale progetto ──────────────────────
     Il primo passo **filtra il secondo, non lo precede come obbligo**: se so già
     il nome del progetto lo scrivo e la forma non la tocco. È la stessa scala di
     precisione del metodo (niente → dominio → progetto), con un gradino in più
     che esiste solo se i nodi lo dichiarano. */
  function disegnaForme(){
    const casa = $('forme');
    const elenco = Dati.forme();
    casa.innerHTML = '';
    casa.hidden = elenco.length < 2;      // con una forma sola non filtra niente
    if (casa.hidden){ formaScelta = null; return; }

    const eti = document.createElement('span');
    eti.className = 'etichetta-campo';
    eti.textContent = 'Che tipo di oggetto · filtra i progetti';
    casa.appendChild(eti);

    const riga = document.createElement('div');
    riga.className = 'forme-righe';
    elenco.forEach(f => {
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'forma'; b.textContent = f;
      b.setAttribute('aria-pressed', String(formaScelta === f));
      b.addEventListener('click', () => {
        formaScelta = (formaScelta === f) ? null : f;   // ritoccarla la toglie
        disegnaForme(); disegnaProgetti(); testo.focus();
      });
      riga.appendChild(b);
    });
    casa.appendChild(riga);
  }

  /* ── i progetti, come suggerimento e mai come obbligo ─────────────────── */
  function disegnaProgetti(){
    const lista = $('elenco-progetti');
    const visibili = Dati.progetti().filter(p => !formaScelta || p.forma === formaScelta);
    lista.innerHTML = '';
    visibili.forEach(p => {
      const o = document.createElement('option');
      o.value = p.id;
      o.label = p.forma || '';
      lista.appendChild(o);
    });

    /* Le scorciatoie mostrano i cinque progetti usati più di recente: sono un
       tocco invece di dodici lettere, che sul telefono è la differenza fra
       scriverlo e saltarlo. */
    /* Con una forma scelta, le scorciatoie sono **tutti** i progetti di quella
       forma: è il senso del filtro. Senza, sono gli ultimi cinque usati. */
    let recenti = [];
    if (formaScelta){
      recenti = visibili.map(p => p.id).slice(0, 8);
    } else {
      Dati.catture().slice().reverse().forEach(r => {
        if (r.dove && !recenti.includes(r.dove) && recenti.length < 5) recenti.push(r.dove);
      });
    }

    const casa = $('progetti-recenti');
    casa.innerHTML = '';
    recenti.forEach(nome => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'scorciatoia-progetto';
      b.textContent = nome;
      b.setAttribute('aria-pressed', String(dove.value.trim() === nome));
      b.addEventListener('click', () => {
        dove.value = (dove.value.trim() === nome) ? '' : nome;   // ritoccarlo lo toglie
        disegnaProgetti();
        testo.focus();
      });
      casa.appendChild(b);
    });
  }

  /* ── salvare ─────────────────────────────────────────────────────────── */
  async function salvaCattura(){
    const r = Dati.aggiungi({ testo: testo.value, tipo: tipoScelto, dove: dove.value });
    if (!r){
      if (testo.value.trim()) App.conferma('memoria piena: esporta e svuota', true);
      return;                                    // testo vuoto: non è un errore
    }

    /* Gli allegati si legano alla cattura appena esiste il suo id. Se questo
       fallisce restano orfani in IndexedDB, e allora è giusto che il
       salvataggio del testo sia già avvenuto: il pensiero non si perde. */
    if (inAllegato.length){
      try { await Media.assegna(inAllegato.map(a => a.id), r.id); }
      catch (e) { App.conferma('allegati non legati', true); }
      inAllegato = [];
      disegnaAllegati();
    }

    testo.value = '';
    /* Il tipo e l'appartenenza RESTANO: capita spesso di catturare due cose di
       fila sullo stesso progetto, e ributtarli ogni volta è attrito che si paga
       a ogni singola cattura. */
    aggiornaSalva();
    aggiornaFinestra('salvata · in attesa');
    App.aggiorna();
    testo.focus();

    /* Le due uscite vengono **dopo** il salvataggio locale e non lo bloccano:
       se falliscono, la cattura è comunque al sicuro e resta «in attesa».
       È la decisione «nessuna chiamata di rete nel percorso del salvataggio»,
       e vale anche adesso che una chiamata di rete esiste. */
    App.conferma('salvato');

    if (Ponte.sincronizzabile()){
      try{
        if (await Ponte.sincronizzaUna(r)){
          aggiornaFinestra('nell\'albero');
          App.conferma('nell\'albero');
        }
      } catch (e){
        aggiornaFinestra('salvata · in attesa');   // riparte al prossimo giro
      }
      App.aggiorna();
    } else if (Ponte.collegata()){
      const fatto = await Ponte.scriviUna(r);
      App.aggiorna();
      if (fatto){
        aggiornaFinestra('scritta in ' + Ponte.nomeCartella());
        App.conferma('scritto in ' + Ponte.nomeCartella());
      }
    }
  }

  function aggiornaSalva(){ salva.disabled = testo.value.trim() === ''; }

  function avvia(){
    disegnaTipi();
    disegnaLegenda();
    disegnaSpiegazione();
    disegnaForme();
    disegnaProgetti();
    disegnaAllegati();

    $('allega').addEventListener('click', () => $('scegli-file').click());
    $('scegli-file').addEventListener('change', scegliFile);

    $('apri-legenda').addEventListener('click', () => {
      const b = $('apri-legenda'), l = $('legenda');
      const aperta = l.hidden;
      l.hidden = !aperta;
      b.setAttribute('aria-expanded', String(aperta));
      b.textContent = aperta ? 'chiudi' : 'che differenza c\'è?';
    });
    aggiornaSalva();
    aggiornaFinestra();

    testo.addEventListener('input', () => { aggiornaSalva(); aggiornaFinestra(); });
    dove.addEventListener('input', () => disegnaProgetti());
    salva.addEventListener('click', salvaCattura);

    /* ⌘/Ctrl + invio funziona da qualunque punto della schermata di cattura,
       anche col fuoco su un altro campo: è la scorciatoia del gesto, non del
       campo di testo. */
    document.addEventListener('keydown', (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter' && App.sezioneCorrente() === 'cattura'){
        e.preventDefault(); salvaCattura();
      }
    });
  }

  return { avvia, disegnaProgetti: () => { disegnaForme(); disegnaProgetti(); },
           fuoco: () => testo.focus() };
})();
