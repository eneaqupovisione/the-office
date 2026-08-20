/* ═══════════════════════════════════════════════════════════════════════════
   L'AGENDA — le schermate di Commissioni e Acquisti.

   `lavori.js` è il motore e non sa niente di interfaccia; qui c'è solo il
   disegno e i gesti. Ogni gesto **riscrive il file e poi rilegge**: è più lento
   di tenere lo stato in memoria, ed è voluto — il file è la verità, e può
   essere cambiato da Claude Code mentre l'app è aperta.
   ═══════════════════════════════════════════════════════════════════════ */

const Agenda = (() => {

  const $ = (id) => document.getElementById(id);

  /* Invio manda il form, sempre. Il submit implicito del browser esiste ma non
     è affidabile su ogni piattaforma, e qui l'invio è **il** gesto: si aggiunge
     una cosa dopo l'altra senza mai staccare le mani. `preventDefault()` prima
     di `requestSubmit()` fa sì che, dove l'implicito funziona, non parta due
     volte. */
  function invioManda(campo, form){
    campo.addEventListener('keydown', (e) => {
      if (e.key !== 'Enter' || e.shiftKey) return;
      e.preventDefault();
      form.requestSubmit ? form.requestSubmit() : form.dispatchEvent(new Event('submit', {cancelable:true}));
    });
  }

  /* Il messaggio che dice perché non si vede niente. Non è un errore: la
     sezione ha bisogno della radice dell'albero, e senza va detto dove si
     collega invece di mostrare una lista vuota che sembra «non hai niente». */
  function serveAlbero(casa){
    casa.innerHTML = '';
    const p = document.createElement('p');
    p.className = 'spiega';
    p.textContent = Ponte.possibile()
      ? 'Serve la cartella collegata: Impostazioni → Collega la cartella, e vuole la radice ~/the-knowledge.'
      : 'Questa sezione vuole Chrome o Edge sul computer: il browser di questo dispositivo non sa aprire cartelle.';
    casa.appendChild(p);
  }

  /* ── una riga con la casella ─────────────────────────────────────────── */
  function riga(v, azioni){
    const el = document.createElement('div');
    el.className = 'voce-lavoro' + (v.fatto ? ' fatta' : '');

    const box = document.createElement('button');
    box.type = 'button';
    box.className = 'casella';
    box.setAttribute('role', 'checkbox');
    box.setAttribute('aria-checked', String(v.fatto));
    box.setAttribute('aria-label', (v.fatto ? 'Fatta: ' : 'Da fare: ') + v.testo);
    box.addEventListener('click', () => azioni.spunta(v, !v.fatto));

    const testo = document.createElement('span');
    testo.className = 'voce-lavoro-testo';
    testo.textContent = v.testo;
    /* Il testo di una voce si corregge — è amministrazione, non scrittura: qui
       non c'è un pensiero da non toccare, c'è una commissione da tenere
       aggiornata. */
    testo.contentEditable = 'true';
    testo.spellcheck = false;
    testo.addEventListener('keydown', (e) => {
      if (e.key === 'Enter'){ e.preventDefault(); testo.blur(); }
      if (e.key === 'Escape'){ testo.textContent = v.testo; testo.blur(); }
    });
    testo.addEventListener('blur', () => {
      const nuovo = testo.textContent.trim();
      if (!nuovo){ testo.textContent = v.testo; return; }
      if (nuovo !== v.testo) azioni.rinomina(v, nuovo);
    });

    const via = document.createElement('button');
    via.type = 'button'; via.className = 'voce-lavoro-togli';
    via.textContent = '×';
    via.setAttribute('aria-label', 'Togli ' + v.testo);
    via.addEventListener('click', () => azioni.elimina(v));

    el.append(box, testo, via);
    return el;
  }

  /* ── commissioni ─────────────────────────────────────────────────────── */
  async function disegnaCommissioni(){
    const casa = $('elenco-commissioni');
    const esito = $('esito-commissioni');
    const elenco = await Lavori.elenco();

    if (elenco === null){
      esito.textContent = ''; $('conto-commissioni').textContent = '';
      serveAlbero(casa); return;
    }
    casa.innerHTML = '';
    if (!elenco.length){
      esito.textContent = 'Nessuna cartella dentro clienti/ nell\'albero.';
      $('conto-commissioni').textContent = '';
      return;
    }
    const inCorso = elenco.reduce((n, c) => n + (c.totali - c.fatte), 0);
    $('conto-commissioni').textContent = inCorso || '';
    esito.textContent = elenco.length + (elenco.length === 1 ? ' commissione · ' : ' commissioni · ')
                      + inCorso + (inCorso === 1 ? ' cosa da fare' : ' cose da fare');

    elenco.forEach(c => {
      const scheda = document.createElement('section');
      scheda.className = 'lavoro';

      const testa = document.createElement('header');
      testa.className = 'lavoro-testa';
      const nome = document.createElement('h2');
      nome.className = 'lavoro-nome'; nome.textContent = c.nome;
      testa.appendChild(nome);
      if (c.stato){
        const s = document.createElement('span');
        s.className = 'lavoro-stato'; s.dataset.stato = c.stato; s.textContent = c.stato;
        testa.appendChild(s);
      }
      const conto = document.createElement('span');
      conto.className = 'lavoro-conto';
      conto.textContent = c.totali ? c.fatte + '/' + c.totali : '—';
      testa.appendChild(conto);
      scheda.appendChild(testa);

      const azioni = {
        spunta:   (v, f) => Lavori.spuntaCommissione(c.nome, v.riga, f).then(rinfresca),
        rinomina: (v, t) => Lavori.rinominaCommissione(c.nome, v.riga, t).then(rinfresca),
        elimina:  (v)    => Lavori.eliminaCommissione(c.nome, v.riga).then(rinfresca)
      };

      /* Prima quello che manca, poi quello che è fatto: è l'ordine con cui si
         guarda una lista di lavoro. Dentro ogni gruppo resta l'ordine del file. */
      const daFare = c.voci.filter(v => !v.fatto);
      const fatte  = c.voci.filter(v => v.fatto);

      if (!c.voci.length){
        const vuoto = document.createElement('p');
        vuoto.className = 'lavoro-vuoto';
        vuoto.textContent = c.esiste ? 'Nessuna cosa da fare scritta.' : 'Non ha ancora un prossimi-passi.md.';
        scheda.appendChild(vuoto);
      }
      daFare.forEach(v => scheda.appendChild(riga(v, azioni)));
      if (fatte.length){
        const t = document.createElement('p');
        t.className = 'lavoro-divisorio'; t.textContent = 'fatte';
        scheda.appendChild(t);
        fatte.forEach(v => scheda.appendChild(riga(v, azioni)));
      }

      const form = document.createElement('form');
      form.className = 'riga-aggiungi riga-aggiungi-lavoro';
      const campo = document.createElement('input');
      campo.type = 'text'; campo.placeholder = 'una cosa da fare';
      campo.autocomplete = 'off';
      const piu = document.createElement('button');
      piu.type = 'submit'; piu.className = 'bottone-min'; piu.textContent = 'Aggiungi';
      form.append(campo, piu);
      invioManda(campo, form);
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const v = campo.value.trim();
        if (!v) return;
        campo.value = '';
        await Lavori.aggiungiACommissione(c.nome, v);
        await rinfresca();
      });
      scheda.appendChild(form);

      casa.appendChild(scheda);
    });
  }

  /* ── acquisti ────────────────────────────────────────────────────────── */
  async function disegnaAcquisti(){
    const casa = $('elenco-acquisti');
    const esito = $('esito-acquisti');
    const dati = await Lavori.acquisti();
    const form = $('aggiungi-acquisto');

    if (dati === null){
      esito.textContent = ''; $('conto-acquisti').textContent = '';
      form.hidden = true; serveAlbero(casa); return;
    }
    form.hidden = false;
    casa.innerHTML = '';

    const resta = dati.totali - dati.fatte;
    $('conto-acquisti').textContent = resta || '';
    esito.textContent = dati.esiste
      ? resta + (resta === 1 ? ' cosa aperta' : ' cose aperte') + ' · personale/acquisti.md'
      : 'Il file personale/acquisti.md non c\'è ancora: lo creo alla prima voce.';

    const azioni = {
      spunta:   (v, f) => Lavori.spuntaAcquisto(v.riga, f).then(rinfresca),
      rinomina: (v, t) => Lavori.rinominaAcquisto(v.riga, t).then(rinfresca),
      elimina:  (v)    => Lavori.eliminaAcquisto(v.riga).then(rinfresca)
    };

    Lavori.SEZIONI_ACQUISTI.forEach(nomeLista => {
      const voci = dati.voci.filter(v => v.sezione.toLowerCase() === nomeLista.toLowerCase());
      if (!voci.length) return;
      const gruppo = document.createElement('section');
      gruppo.className = 'lavoro';
      const testa = document.createElement('header');
      testa.className = 'lavoro-testa';
      const h = document.createElement('h2');
      h.className = 'lavoro-nome'; h.textContent = nomeLista;
      const conto = document.createElement('span');
      conto.className = 'lavoro-conto'; conto.textContent = String(voci.length);
      testa.append(h, conto);
      gruppo.appendChild(testa);
      voci.forEach(v => gruppo.appendChild(riga(v, azioni)));
      casa.appendChild(gruppo);
    });

    if (!casa.children.length){
      const vuoto = document.createElement('p');
      vuoto.className = 'lavoro-vuoto';
      vuoto.textContent = 'Niente in lista.';
      casa.appendChild(vuoto);
    }
  }

  /* Ridisegna la sezione che si sta guardando. Le due non si aggiornano a
     vicenda: leggere file costa, e la sezione nascosta la si rilegge quando ci
     si torna sopra. */
  async function rinfresca(){
    const dove = App.sezioneCorrente();
    if (dove === 'commissioni') await disegnaCommissioni();
    if (dove === 'acquisti')    await disegnaAcquisti();
    App.aggiorna();
  }

  function avvia(){
    const sel = $('lista-acquisto');
    Lavori.SEZIONI_ACQUISTI.forEach(s => sel.appendChild(new Option(s, s)));

    invioManda($('nuovo-acquisto'), $('aggiungi-acquisto'));
    $('aggiungi-acquisto').addEventListener('submit', async (e) => {
      e.preventDefault();
      const campo = $('nuovo-acquisto');
      const v = campo.value.trim();
      if (!v) return;
      campo.value = '';
      await Lavori.aggiungiAcquisto(v, sel.value);
      await disegnaAcquisti();
    });
  }

  return { avvia, disegnaCommissioni, disegnaAcquisti, rinfresca };
})();
