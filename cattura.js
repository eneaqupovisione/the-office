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
  /* Un solo punto per scegliere un tipo: lo usano le caselle e il
     riconoscitore, così non possono divergere. `null` lo toglie — niente è
     obbligatorio. */
  function scegliTipo(id){
    tipoScelto = id || null;
    document.querySelectorAll('#tipi .tipo').forEach(x =>
      x.setAttribute('aria-pressed', String(x.dataset.tipo === tipoScelto)));
    salva.dataset.tipo = tipoScelto || '';
    disegnaSpiegazione();
  }

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
        scegliTipo(tipoScelto === t.id ? null : t.id);
        testo.focus();                       // il fuoco torna sempre al lampo
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

  /* ── quello che l'app ha capito ───────────────────────────────────────────
     Serve alle note dettate: le intitoli «cantera idea» e le incolli qui. Non
     decide da sola — mostra cosa ha letto e aspetta un tocco. Se sbaglia, un
     tocco su «ignora» e non ne parla più per questa cattura. */
  let riconoscimentoIgnorato = false;

  function disegnaCapito(){
    const casa = $('capito');
    casa.innerHTML = '';
    const r = riconoscimentoIgnorato ? null : Dati.riconosci(testo.value);
    /* Non propone quello che hai già scelto a mano: sarebbe rumore. */
    const utile = r && ((r.tipo && r.tipo !== tipoScelto) || (r.dove && r.dove !== dove.value.trim()));
    casa.hidden = !utile;
    if (!utile) return;

    const eti = document.createElement('span');
    eti.className = 'capito-testo';
    eti.append(document.createTextNode('ho letto '));
    if (r.tipo){
      const t = document.createElement('strong'); t.dataset.tipo = r.tipo;
      t.className = 'capito-tipo'; t.textContent = r.tipo; eti.appendChild(t);
    }
    if (r.tipo && r.dove) eti.append(document.createTextNode(' per '));
    if (r.dove){
      const p = document.createElement('strong'); p.textContent = r.dove; eti.appendChild(p);
    }

    const usa = document.createElement('button');
    usa.type = 'button'; usa.className = 'capito-usa'; usa.textContent = 'usa';
    usa.addEventListener('click', () => {
      if (r.tipo) scegliTipo(r.tipo);
      if (r.dove) dove.value = r.dove;
      if (r.resto !== testo.value){ testo.value = r.resto; aggiornaSalva(); aggiornaFinestra(); }
      disegnaProgetti(); disegnaCapito(); testo.focus();
    });

    const no = document.createElement('button');
    no.type = 'button'; no.className = 'capito-no'; no.textContent = 'ignora';
    no.setAttribute('aria-label', 'Ignora');
    no.addEventListener('click', () => { riconoscimentoIgnorato = true; disegnaCapito(); testo.focus(); });

    casa.append(eti, usa, no);
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
    const scritto = dove.value.trim().toLowerCase();
    const visibili = Dati.progetti()
      .filter(p => !formaScelta || p.forma === formaScelta)
      .filter(p => !scritto || p.id.includes(scritto));

    /* Le scorciatoie mostrano i cinque progetti usati più di recente: sono un
       tocco invece di dodici lettere, che sul telefono è la differenza fra
       scriverlo e saltarlo. */
    /* Tre casi, e nessuno usa `<datalist>`: su Safari iPhone non compare, ed è
       lì che serve di più.
       • stai scrivendo → i progetti **che esistono** e che contengono quello
         che hai scritto: è il completamento;
       • hai scelto una forma → tutti i progetti di quella forma;
       • campo vuoto → gli ultimi cinque usati. */
    let recenti = [];
    if (scritto || formaScelta){
      recenti = visibili.map(p => p.id).slice(0, 8);
    } else {
      Dati.catture().slice().reverse().forEach(r => {
        if (r.dove && !recenti.includes(r.dove) && recenti.length < 5) recenti.push(r.dove);
      });
    }
    /* Se scrivi un nome che non esiste, non lo si nasconde e non si corregge:
       l'appartenenza è alla precisione che hai adesso, anche se è nuova. */
    const nuovo = scritto && !visibili.some(p => p.id === Dati.normalizza(dove.value));

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

    if (nuovo){
      const n = document.createElement('span');
      n.className = 'progetto-nuovo';
      n.textContent = 'nuovo: ' + Dati.normalizza(dove.value);
      casa.appendChild(n);
    }
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
    riconoscimentoIgnorato = false;
    aggiornaSalva();
    disegnaCapito();
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
    disegnaCapito();

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

    testo.addEventListener('input', () => { aggiornaSalva(); aggiornaFinestra(); disegnaCapito(); });
    dove.addEventListener('input', () => { disegnaProgetti(); disegnaCapito(); });
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
