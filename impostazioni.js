/* ═══════════════════════════════════════════════════════════════════════════
   IMPOSTAZIONI — le tre strade, l'aspetto, e la verità su dove finiscono le
   catture.

   **Niente stato scritto a mano.** Qui c'era un elenco di «cose che ancora non
   ci sono», ed è diventato falso due volte nello stesso giorno: appena una di
   quelle cose veniva fatta, il pannello continuava a dirla mancante. Ora
   `statoVero()` lo calcola da quello che l'app riesce davvero a fare. Se
   qualcuno riscrive lì dentro una frase fissa, ha rimesso la bugia.
   ═══════════════════════════════════════════════════════════════════════ */

const Impostazioni = (() => {

  const $ = (id) => document.getElementById(id);
  let permessoScaduto = false;

  /* ── il tema ─────────────────────────────────────────────────────────────
     Carta di base: la direzione 06 vive su carta, e i suoi colori — acido,
     cielo, menta, il grigio dell'interfaccia — sono calibrati lì. La notte
     esiste e si sceglie; «sistema» segue il telefono. */
  function applicaTema(t){
    document.body.dataset.tema = t;
    const meta = document.querySelector('meta[name="theme-color"]');
    const chiaro = t === 'chiaro' ||
      (t === 'sistema' && window.matchMedia('(prefers-color-scheme: light)').matches);
    if (meta) meta.setAttribute('content', chiaro ? '#F4F3EE' : '#0C0C0E');
    document.querySelectorAll('#segmento-tema button').forEach(b =>
      b.setAttribute('aria-pressed', String(b.dataset.tema === t)));
  }

  /* ── lo stato vero, calcolato ─────────────────────────────────────────────
     Prima qui c'era un elenco scritto a mano di «cose che ancora non ci sono».
     È diventato falso **due volte in un giorno** — appena una di quelle cose
     veniva fatta, il pannello continuava a dirla mancante. Un avviso che mente
     è peggio di nessun avviso, quindi ora si calcola da quello che l'app
     riesce davvero a fare. */
  function statoVero(){
    const casa = $('stato-vero');
    casa.innerHTML = '';
    const attesa = Dati.inAttesa().length;

    const strade = [
      { nome:'Sincronizzazione', attiva: Ponte.sincronizzabile(),
        se:  'ogni cattura va in _inbox/ su GitHub da sola, anche dal telefono',
        no:  !location.protocol.startsWith('http')
               ? 'serve aprire l\'app dal sito, non da un file sul disco'
               : 'manca la chiave d\'app qui sopra' },
      { nome:'Cartella collegata', attiva: Ponte.collegata(),
        se:  'le catture finiscono anche in ' + (Ponte.nomeCartella() || 'una cartella locale'),
        no:  Ponte.possibile() ? 'non collegata — è una scorciatoia da computer, non serve se la sincronizzazione va'
                               : 'questo browser non la sostiene (è normale su iPhone)' },
      { nome:'Esportazione', attiva: true,
        se:  'funziona sempre, anche senza niente configurato',
        no:  '' }
    ];

    strade.forEach(st => {
      const r = document.createElement('div');
      r.className = 'riga-stato' + (st.attiva ? ' attiva' : '');
      const s1 = document.createElement('span');
      s1.className = 'riga-stato-segno'; s1.textContent = st.attiva ? '✓' : '·';
      const s2 = document.createElement('span');
      s2.className = 'riga-stato-nome'; s2.textContent = st.nome;
      const s3 = document.createElement('span');
      s3.className = 'riga-stato-nota'; s3.textContent = st.attiva ? st.se : st.no;
      r.append(s1, s2, s3);
      casa.appendChild(r);
    });

    const p = document.createElement('p');
    p.className = 'spiega';
    p.style.padding = '13px 0 0';
    p.textContent = attesa
      ? attesa + (attesa === 1 ? ' cattura non è' : ' catture non sono') + ' ancora uscita di qui.'
      : 'Tutto quello che hai catturato è uscito di qui.';
    casa.appendChild(p);
  }

  /* ── la sincronizzazione ─────────────────────────────────────────────────
     Qui si digita la chiave d'app, che è l'unico segreto che questo dispositivo
     conosce — e non è il token: apre solo l'aggiunta di file in `_inbox/`. */
  function statoSincronia(){
    const el = $('stato-sincronia');
    const attesa = Dati.inAttesa().length;
    const haChiave = !!Ponte.chiaveApp();
    $('chiave-app').placeholder = haChiave ? '•••••••• (salvata su questo dispositivo)' : 'chiave d\'app';

    if (!location.protocol.startsWith('http')){
      el.className = 'esito';
      el.textContent = 'Da un file aperto sul disco il portiere non esiste. '
        + 'La sincronizzazione funziona dal sito, ed è lì che va usata l\'app.';
    } else if (!haChiave){
      el.className = 'esito';
      el.textContent = 'Non configurata. Serve la chiave d\'app — la stessa che sta '
        + 'in CHIAVE_APP fra le variabili d\'ambiente di Netlify.';
    } else {
      el.className = 'esito bene';
      el.textContent = 'Attiva: ogni cattura va in _inbox/ da sola.'
        + (attesa ? ' ' + attesa + ' ancora da mandare.' : '');
    }
    $('sincronizza-ora').disabled = !Ponte.sincronizzabile() || attesa === 0;
    $('prova-portiere').disabled = !location.protocol.startsWith('http');
  }

  async function provaPortiere(){
    const el = $('stato-sincronia');
    el.className = 'esito'; el.textContent = 'provo…';
    try{
      const r = await fetch('/.netlify/functions/cattura', {
        method:'POST',
        headers:{ 'content-type':'application/json', 'x-chiave': Ponte.chiaveApp() },
        body: JSON.stringify({ percorso:'', contenuto:'' })
      });
      /* 400 «percorso non ammesso» è la risposta **giusta**: vuol dire che il
         portiere c'è, è configurato e la chiave è passata. */
      if (r.status === 400){ el.className='esito bene'; el.textContent = '▸ il portiere risponde e la chiave è giusta.'; }
      else if (r.status === 401){ el.className='esito male'; el.textContent = 'la chiave non combacia con CHIAVE_APP su Netlify.'; }
      else if (r.status === 500){ el.className='esito male'; el.textContent = 'il portiere c\'è ma gli mancano le variabili (CHIAVE_APP o GITHUB_TOKEN).'; }
      else if (r.status === 404){ el.className='esito male'; el.textContent = 'il portiere non è pubblicato: manca il deploy della funzione.'; }
      else { el.className='esito'; el.textContent = 'risposta inattesa: ' + r.status; }
    } catch (e){
      el.className = 'esito male';
      el.textContent = 'non ci arrivo: rete assente, o il sito non è quello con la funzione.';
    }
  }

  async function sincronizzaOra(){
    const attesa = Dati.inAttesa();
    if (!attesa.length){ App.conferma('niente da mandare'); return; }
    $('sincronizza-ora').disabled = true;
    const { fatte, errori, motivo } = await Ponte.sincronizzaTutte(attesa);
    App.aggiorna();
    App.conferma(errori ? (fatte + ' mandate, ' + errori + ' no' + (motivo ? ' · ' + motivo : ''))
                        : (fatte + ' nell\'albero'), !!errori);
  }

  /* ── la cartella collegata ───────────────────────────────────────────── */
  function statoCartella(){
    const el = $('stato-cartella');
    const attesa = Dati.inAttesa().length;

    if (!Ponte.possibile()){
      el.className = 'esito';
      el.textContent = 'Questo browser non sa collegare una cartella. Funziona su Chrome '
        + 'o Edge da computer, e serve https o localhost. Su iPhone resta l\'esportazione.';
      $('collega-cartella').disabled = true;
      $('scrivi-ora').disabled = true;
      $('scollega-cartella').disabled = true;
      return;
    }

    $('collega-cartella').disabled = false;

    if (Ponte.collegata()){
      el.className = 'esito bene';
      el.textContent = '▸ ' + Ponte.nomeCartella()
        + (Ponte.vedeLAlbero()
            ? ' — le catture finiscono in _inbox/ da sole, e l\'app vede i progetti dell\'albero.'
            : ' — le catture ci finiscono dentro da sole. Da qui però l\'albero non si vede: '
              + 'ricollega la radice ~/the-knowledge per avere anche i progetti veri.')
        + (attesa ? ' ' + attesa + ' in attesa di essere scritte.' : '');
      $('collega-cartella').textContent = 'Cambia cartella';
      $('scrivi-ora').disabled = attesa === 0;
      $('scollega-cartella').disabled = false;
    } else if (permessoScaduto){
      el.className = 'esito male';
      el.textContent = 'La cartella c\'è ma il browser ha lasciato scadere il permesso. '
        + 'Un tocco su «Collega» lo rinnova senza rifare la scelta.';
      $('collega-cartella').textContent = 'Rinnova il permesso';
      $('scrivi-ora').disabled = true;
      $('scollega-cartella').disabled = false;
    } else {
      el.className = 'esito';
      el.textContent = 'Non collegata. Le catture escono di qui solo con l\'esportazione.';
      $('collega-cartella').textContent = 'Collega la cartella';
      $('scrivi-ora').disabled = true;
      $('scollega-cartella').disabled = true;
    }
  }

  async function collega(){
    try{
      if (permessoScaduto && await Ponte.riprova()){
        permessoScaduto = false;
        App.aggiorna(); App.conferma('permesso rinnovato');
        return;
      }
      await Ponte.collega();
      permessoScaduto = false;
      App.aggiorna();
      App.conferma('collegata a ' + Ponte.nomeCartella());
    } catch (e){
      if (e && e.name === 'AbortError') return;          // ha chiuso il pannello: non è un errore
      App.conferma('non collegata', true);
    }
  }

  async function scriviOra(){
    const attesa = Dati.inAttesa();
    if (!attesa.length){ App.conferma('niente in attesa'); return; }
    $('scrivi-ora').disabled = true;
    const { scritte, errori } = await Ponte.scriviTutte(attesa);
    App.aggiorna();
    App.conferma(errori ? scritte + ' scritte, ' + errori + ' no' : scritte + ' scritte', !!errori);
  }

  /* ── l'esportazione ──────────────────────────────────────────────────── */
  function esporta(){
    const righe = Dati.inAttesa();
    if (!righe.length){ App.conferma('niente da esportare'); return; }
    Ponte.scarica(Ponte.componiEsportazione(righe),
                  'catture-' + Dati.orario(new Date()) + '.md', 'text/markdown');
    Dati.segnaUscite(righe.map(r => r.id), 'esportazione');
    App.aggiorna();
    App.conferma(righe.length + ' esportati');
  }

  /* Il `.json` è per il codice: stessi campi del modello, senza il rumore dei
     separatori. Esporta **tutto**, anche ciò che è già uscito, perché serve a
     leggere l'archivio da fuori e non a smistare. */
  function esportaJson(){
    const righe = Dati.catture();
    if (!righe.length){ App.conferma('niente da esportare'); return; }
    Ponte.scarica(JSON.stringify({
      generato: new Date().toISOString(),
      origine: 'the-office',
      progetti: Dati.progetti(),
      catture: righe
    }, null, 2), 'the-office-' + Dati.orario(new Date()) + '.json', 'application/json');
    App.conferma(righe.length + ' oggetti');
  }

  /* ── svuotare ────────────────────────────────────────────────────────────
     L'unico gesto distruttivo totale, quindi conferma esplicita e avvertimento
     se c'è roba mai uscita di qui. Perdere una cattura è la cosa che questo
     sistema esiste per impedire. */
  function svuota(){
    const righe = Dati.catture();
    if (!righe.length){ App.conferma('già vuota'); return; }
    const attesa = Dati.inAttesa().length;
    const avviso = attesa
      ? '\n\n⚠️ ' + attesa + ' non sono mai uscite da qui. Andrebbero perse per sempre.'
      : '';
    if (confirm('Cancellare ' + righe.length + ' catture da questo dispositivo?' + avviso)){
      Dati.svuota(); App.aggiorna(); App.conferma('svuotata');
    }
  }

  async function avvia(){
    applicaTema(Dati.impostazioni().tema);
    document.querySelectorAll('#segmento-tema button').forEach(b =>
      b.addEventListener('click', () => {
        Dati.imposta({ tema: b.dataset.tema });
        applicaTema(b.dataset.tema);
      }));
    window.matchMedia('(prefers-color-scheme: light)')
      .addEventListener('change', () => applicaTema(Dati.impostazioni().tema));

    $('salva-chiave').addEventListener('submit', (e) => {
      e.preventDefault();
      const campo = $('chiave-app');
      Ponte.impostaChiave(campo.value);
      campo.value = '';
      App.aggiorna();
      App.conferma(Ponte.chiaveApp() ? 'chiave salvata' : 'chiave tolta');
    });
    $('sincronizza-ora').addEventListener('click', sincronizzaOra);
    $('prova-portiere').addEventListener('click', provaPortiere);

    $('collega-cartella').addEventListener('click', collega);
    $('scrivi-ora').addEventListener('click', scriviOra);
    $('scollega-cartella').addEventListener('click', async () => {
      await Ponte.scollega(); permessoScaduto = false; App.aggiorna(); App.conferma('scollegata');
    });
    $('esporta').addEventListener('click', esporta);
    $('esporta-json').addEventListener('click', esportaJson);
    $('svuota').addEventListener('click', svuota);

    const ripresa = await Ponte.riprendi();
    permessoScaduto = !!(ripresa && ripresa.permesso !== 'granted');
    App.aggiorna();
  }

  return { avvia, statoCartella, statoSincronia, statoVero, applicaTema };
})();
