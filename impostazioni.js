/* ═══════════════════════════════════════════════════════════════════════════
   IMPOSTAZIONI — il ponte, l'aspetto, e la verità su ciò che manca.

   Il pannello «quello che ancora non c'è» è scritto nell'HTML e va tenuto
   aggiornato: dichiara che telefono e computer restano due mucchi separati
   finché non esistono repo pubblicato, sito Netlify e token. È un avviso, non
   un promemoria decorativo — la trappola numero uno di questo progetto è
   crederlo già sincronizzato.
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

  return { avvia, statoCartella, applicaTema };
})();
