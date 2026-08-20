/* ═══════════════════════════════════════════════════════════════════════════
   LE IDEE — la schermata che si apre, e l'unica che conta davvero.

   Si scrive e basta. **Nessuna griglia di tipi**: al momento del lampo l'unica
   cosa che sai e che un agente non può dedurre è di che progetto si tratta, ed
   è l'unico campo rimasto. Che genere di cosa sia lo decide lo smistamento.

   Tutto ciò che sta qui sotto è facoltativo tranne il testo: `Dati.aggiungi()`
   rifiuta la cattura vuota e nient'altro.
   ═══════════════════════════════════════════════════════════════════════ */

const Cattura = (() => {

  const $ = (id) => document.getElementById(id);
  const testo = $('testo'), dove = $('dove'), salva = $('salva');

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
    const utile = r && r.dove && r.dove !== dove.value.trim();
    casa.hidden = !utile;
    if (!utile) return;

    const eti = document.createElement('span');
    eti.className = 'capito-testo';
    eti.append(document.createTextNode('ho letto '));
    const p = document.createElement('strong'); p.textContent = r.dove; eti.appendChild(p);

    const usa = document.createElement('button');
    usa.type = 'button'; usa.className = 'capito-usa'; usa.textContent = 'usa';
    usa.addEventListener('click', () => {
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
    const r = Dati.aggiungi({ testo: testo.value, dove: dove.value });
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
    /* L'appartenenza RESTA: capita spesso di catturare due cose di fila sullo
       stesso progetto, e ributtarla ogni volta è attrito che si paga a ogni
       singola cattura. */
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
    disegnaForme();
    disegnaProgetti();
    disegnaAllegati();
    disegnaCapito();

    $('allega').addEventListener('click', () => $('scegli-file').click());
    $('scegli-file').addEventListener('change', scegliFile);

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
