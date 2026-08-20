/* ═══════════════════════════════════════════════════════════════════════════
   THE OFFICE — l'avvio, la navigazione, il contatore.

   Sei sezioni, e una sola riceve il fuoco all'apertura: **le idee**. Tutto il
   resto sta dietro il menu, dove non ci si finisce per sbaglio.

   Due famiglie, e si comportano diversamente. Idee e archivio vivono in
   `localStorage`: si ridisegnano a ogni `aggiorna()`, costano niente.
   Commissioni e acquisti leggono file veri dal disco: si ridisegnano solo
   quando ci si entra.
   ═══════════════════════════════════════════════════════════════════════ */

const App = (() => {

  const $ = (id) => document.getElementById(id);
  const SEZIONI = {
    cattura:      'Idee',
    archivio:     'Archivio',
    commissioni:  'Commissioni',
    acquisti:     'Acquisti',
    progetti:     'Progetti',
    impostazioni: 'Impostazioni'
  };

  /* Commissioni e acquisti leggono file dal disco: si ridisegnano quando ci si
     entra, non a ogni `aggiorna()`. Leggere venti file a ogni cattura salvata
     sarebbe lavoro sprecato in una sezione che non si sta guardando. */
  const DA_LEGGERE = {
    commissioni: () => Agenda.disegnaCommissioni(),
    acquisti:    () => Agenda.disegnaAcquisti()
  };
  let sezione = 'cattura';

  /* ── navigazione ─────────────────────────────────────────────────────── */
  function vaiA(nome, daHash){
    if (!SEZIONI[nome]) nome = 'cattura';
    sezione = nome;

    document.querySelectorAll('.sez').forEach(s => { s.hidden = s.dataset.sez !== nome; });
    document.querySelectorAll('.voce').forEach(v => {
      v.dataset.sez === nome ? v.setAttribute('aria-current','page') : v.removeAttribute('aria-current');
    });
    $('titolo-sez').textContent = SEZIONI[nome];

    if (!daHash && location.hash.slice(1) !== nome) location.hash = nome;
    chiudiMenu();
    aggiorna();

    /* Il fuoco torna al lampo ogni volta che si atterra sulla cattura — su
       telefono no: aprirebbe la tastiera addosso a chi sta solo navigando. */
    if (nome === 'cattura' && window.innerWidth >= 900) Cattura.fuoco();
    if (DA_LEGGERE[nome]) DA_LEGGERE[nome]();
  }

  /* ── il menu laterale ────────────────────────────────────────────────────
       Sotto i 900px è un pannello che entra da sinistra e si trascina via col
       dito: 1:1 mentre il dito è giù, e alla fine decide con la velocità, non
       con la posizione. Sopra i 900px non si apre e non si chiude: sta lì. */
  const lato = $('lato'), velo = $('velo'), bottone = $('apri-menu');
  let aperto = false;

  function apriMenu(){
    if (window.innerWidth >= 900) return;
    aperto = true;
    lato.classList.add('aperto');
    bottone.setAttribute('aria-expanded','true');
    velo.hidden = false;
    requestAnimationFrame(() => velo.classList.add('mostra'));
  }
  function chiudiMenu(){
    if (!aperto) return;
    aperto = false;
    lato.classList.remove('aperto');
    lato.style.removeProperty('--trascina');
    bottone.setAttribute('aria-expanded','false');
    velo.classList.remove('mostra');
    setTimeout(() => { if (!aperto) velo.hidden = true; }, 340);
  }

  /* Proiezione del punto di arrivo alla iOS: un colpetto veloce chiude anche se
     il pannello si è mosso di pochi pixel, perché è dove il gesto *stava
     andando* che conta, non dove si è fermato il dito. */
  function proietta(velocita, decelerazione = 0.998){
    return (velocita / 1000) * decelerazione / (1 - decelerazione);
  }

  function abilitaTrascinamento(){
    let attivo = false, partenza = 0, ultimo = 0, ultimoT = 0, velocita = 0, largo = 0;

    lato.addEventListener('pointerdown', (e) => {
      if (!aperto || window.innerWidth >= 900) return;
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      attivo = true;
      largo = lato.getBoundingClientRect().width;
      partenza = ultimo = e.clientX; ultimoT = e.timeStamp; velocita = 0;
      lato.classList.add('trascinato');
      lato.setPointerCapture(e.pointerId);
    });

    lato.addEventListener('pointermove', (e) => {
      if (!attivo) return;
      const dt = e.timeStamp - ultimoT;
      if (dt > 0) velocita = (e.clientX - ultimo) / dt * 1000;   // px al secondo
      ultimo = e.clientX; ultimoT = e.timeStamp;

      /* Verso destra non si va: il pannello è già a casa sua. Resistenza
         progressiva invece di un muro, così resta vivo sotto il dito. */
      let dx = e.clientX - partenza;
      if (dx > 0) dx = (dx * largo * .55) / (largo + .55 * dx);
      lato.style.setProperty('--trascina', dx + 'px');
      velo.style.opacity = String(Math.max(0, 1 + Math.min(0, dx) / largo));
    });

    function rilascia(e){
      if (!attivo) return;
      attivo = false;
      lato.classList.remove('trascinato');
      lato.releasePointerCapture?.(e.pointerId);
      velo.style.removeProperty('opacity');

      const dx = Math.min(0, ultimo - partenza);
      const arrivo = dx + proietta(velocita);
      lato.style.removeProperty('--trascina');
      if (arrivo < -largo / 2) chiudiMenu();
    }
    lato.addEventListener('pointerup', rilascia);
    lato.addEventListener('pointercancel', rilascia);
  }

  /* ── il contatore, che è sacro ───────────────────────────────────────────
     Quante ne aspettano di uscire da questo dispositivo. Sempre in vista: nel
     menu quando c'è spazio, nella testata quando non ce n'è. Senza, la fiducia
     crolla in due settimane e ricomincio a segnarmi le cose anche altrove. */
  function aggiornaContatore(){
    const attesa = Dati.inAttesa().length;
    const tutte  = Dati.catture().length;

    $('stato-numero').textContent = attesa;
    $('stato-etichetta').textContent = attesa === 1 ? 'in attesa' : 'in attesa';
    $('stato-lato').classList.toggle('pieno', attesa > 0);

    $('contatore').textContent = attesa ? attesa + ' in attesa' : (tutte ? 'inbox vuota' : 'niente ancora');
    $('contatore').classList.toggle('pieno', attesa > 0);

    $('conto-archivio').textContent = tutte || '';
    $('conto-progetti').textContent = Dati.progetti().length || '';

    const ponte = $('stato-ponte');
    if (Ponte.sincronizzabile()) ponte.textContent = '▸ nell\'albero, da sola';
    else if (Ponte.collegata()) ponte.textContent = '▸ ' + Ponte.nomeCartella();
    else {
      const u = Dati.ultimaEsportazione();
      ponte.textContent = u ? 'ultima uscita ' + u.slice(0,10) : 'mai uscite di qui';
    }
  }

  /* Un solo punto da chiamare dopo ogni cambiamento: le schermate nascoste si
     ridisegnano lo stesso, costano niente e non c'è modo di dimenticarsene. */
  function aggiorna(){
    aggiornaContatore();
    Cattura.disegnaProgetti();
    Archivio.disegna();
    Progetti.disegna();
    Impostazioni.statoCartella();
    Impostazioni.statoSincronia();
    Impostazioni.statoVero();
  }

  /* ── la conferma ─────────────────────────────────────────────────────── */
  const conferma_ = $('conferma');
  function conferma(t, male){
    conferma_.textContent = t;
    conferma_.classList.toggle('male', !!male);
    conferma_.classList.remove('mostra');
    void conferma_.offsetWidth;                    // riavvia l'animazione
    conferma_.classList.add('mostra');
  }

  /* ── avvio ───────────────────────────────────────────────────────────── */
  function avvia(){
    Dati.travasa();

    Cattura.avvia();
    Archivio.avvia();
    Agenda.avvia();
    Progetti.avvia();
    Impostazioni.avvia();          // asincrona: chiama aggiorna() quando ha finito

    bottone.addEventListener('click', () => aperto ? chiudiMenu() : apriMenu());
    velo.addEventListener('click', chiudiMenu);
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') chiudiMenu(); });
    document.querySelectorAll('.voce').forEach(v =>
      v.addEventListener('click', (e) => { e.preventDefault(); vaiA(v.dataset.sez); }));
    window.addEventListener('hashchange', () => vaiA(location.hash.slice(1), true));
    abilitaTrascinamento();

    vaiA(location.hash.slice(1) || 'cattura', true);
    if (window.innerWidth >= 900) Cattura.fuoco();

    /* Funziona anche senza rete: il lampo arriva in ascensore e in metropolitana. */
    if ('serviceWorker' in navigator && location.protocol !== 'file:'){
      window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
    }
  }

  return { avvia, aggiorna, conferma, vaiA, sezioneCorrente: () => sezione };
})();

App.avvia();
