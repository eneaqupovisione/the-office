/* ═══════════════════════════════════════════════════════════════════════════
   L'ARCHIVIO — si legge e si riordina, non si riscrive.

   Qui si cambia il **progetto** di una cattura, e si può cancellarla. Il **testo non si modifica**: non esiste un campo per farlo,
   ed è voluto.

   La cattura resta comunque la schermata che si apre: l'archivio sta dietro il
   menu, dove non si finisce per sbaglio.
   ═══════════════════════════════════════════════════════════════════════ */

const Archivio = (() => {

  const $ = (id) => document.getElementById(id);
  let cerca = '';

  const MESI = ['gen','feb','mar','apr','mag','giu','lug','ago','set','ott','nov','dic'];
  function quando(iso){
    const d = new Date(iso);
    const p = (n) => String(n).padStart(2,'0');
    return d.getDate() + ' ' + MESI[d.getMonth()] + ' · ' + p(d.getHours()) + ':' + p(d.getMinutes());
  }

  function passa(r){
    if (!cerca) return true;
    const q = cerca.toLowerCase();
    return r.testo.toLowerCase().includes(q)
        || (r.dove || '').toLowerCase().includes(q)
        || (r.tipo || '').toLowerCase().includes(q);
  }

  /* ── una cattura ─────────────────────────────────────────────────────── */
  function scheda(r){
    const el = document.createElement('article');
    el.className = 'cattura';
    /* Il tipo colora la sua etichetta, non la scheda: in un elenco lungo una
       parete di riquadri colorati si legge peggio, non meglio. Senza tipo
       l'etichetta non c'è, e si vede che è una cattura ancora da smistare. */
    if (r.tipo) el.dataset.tipo = r.tipo;

    const t = document.createElement('div');
    t.className = 'cattura-testo';
    t.textContent = r.testo;                       // testo, non HTML: mai interpretato
    el.appendChild(t);

    const meta = document.createElement('div');
    meta.className = 'cattura-meta';
    if (r.tipo){
      const tag = document.createElement('span');
      tag.className = 'tag-tipo'; tag.textContent = r.tipo;
      meta.appendChild(tag);
    }
    const data = document.createElement('span');
    data.textContent = quando(r.quando);
    meta.appendChild(data);

    const stato = document.createElement('span');
    stato.className = 'tag-stato' + (r.uscita ? ' fuori' : '');
    stato.textContent = r.uscita
      ? (r.uscita.come === 'cartella' ? 'nella cartella' : 'esportata')
      : 'in attesa';
    meta.appendChild(stato);

    /* Se ha allegati lo dice: dopo il salvataggio sono invisibili, e un file
       che non sai di avere è un file che non uscirà mai di qui. */
    if (typeof Media !== 'undefined'){
      Media.perCattura(r.id).then(a => {
        if (!a.length) return;
        const tag = document.createElement('span');
        tag.className = 'tag-allegati';
        tag.textContent = a.length === 1 ? '1 allegato' : a.length + ' allegati';
        meta.insertBefore(tag, stato);
      }).catch(() => {});
    }

    const apri = document.createElement('button');
    apri.type = 'button'; apri.className = 'azioni-apri';
    apri.textContent = '⋯'; apri.setAttribute('aria-label', 'Azioni');
    meta.appendChild(apri);
    el.appendChild(meta);

    const azioni = document.createElement('div');
    azioni.className = 'cattura-azioni'; azioni.hidden = true;

    const selDove = document.createElement('select');
    selDove.setAttribute('aria-label','Progetto');
    selDove.appendChild(new Option('— senza progetto —',''));
    Dati.progetti().forEach(p => selDove.appendChild(new Option(p.id, p.id)));
    if (r.dove && !Dati.progetti().some(p => p.id === r.dove))
      selDove.appendChild(new Option(r.dove, r.dove));
    selDove.value = r.dove || '';
    selDove.addEventListener('change', () => {
      Dati.rietichetta(r.id, { dove: selDove.value }); App.aggiorna();
    });

    const togli = document.createElement('button');
    togli.type = 'button'; togli.className = 'bottone-min'; togli.textContent = 'Elimina';
    togli.addEventListener('click', () => {
      /* L'unico gesto distruttivo per riga. Se non è mai uscita di qui, sparisce
         davvero: è esattamente la cosa che il sistema esiste per impedire. */
      const avviso = r.uscita ? '' : '\n\n⚠️ Non è mai uscita da questo dispositivo.';
      if (confirm('Eliminare questa cattura?' + avviso)){
        Dati.elimina(r.id); App.aggiorna(); App.conferma('eliminata');
      }
    });

    azioni.append(selDove, togli);
    el.appendChild(azioni);

    apri.addEventListener('click', () => { azioni.hidden = !azioni.hidden; });
    return el;
  }

  /* ── i gruppi ────────────────────────────────────────────────────────────
     Raggruppate per progetto, e dentro ogni gruppo la più recente in alto.
     «Senza progetto» sta in fondo: è il mucchio da smistare, non la prima cosa
     da guardare. */
  function disegna(){
    const casa = $('elenco-archivio');
    casa.innerHTML = '';

    const righe = Dati.catture().filter(passa).reverse();
    if (!righe.length){
      const v = document.createElement('p');
      v.className = 'vuoto';
      v.textContent = Dati.catture().length ? 'Niente che corrisponda.' : 'Ancora niente. Il posto giusto è la cattura.';
      casa.appendChild(v);
      return;
    }

    const gruppi = new Map();
    righe.forEach(r => {
      const k = r.dove || '';
      if (!gruppi.has(k)) gruppi.set(k, []);
      gruppi.get(k).push(r);
    });

    const chiavi = [...gruppi.keys()].sort((a,b) => (a === '') - (b === '') || a.localeCompare(b));
    chiavi.forEach(k => {
      const d = document.createElement('details');
      d.className = 'gruppo'; d.open = true;
      const s = document.createElement('summary');
      const nome = document.createElement('span');
      nome.textContent = k || 'senza progetto';
      const conto = document.createElement('span');
      conto.className = 'gruppo-conto'; conto.textContent = gruppi.get(k).length;
      s.append(nome, conto);
      d.appendChild(s);
      gruppi.get(k).forEach(r => d.appendChild(scheda(r)));
      casa.appendChild(d);
    });
  }

  function avvia(){
    $('cerca').addEventListener('input', (e) => { cerca = e.target.value.trim(); disegna(); });
  }

  return { avvia, disegna };
})();
