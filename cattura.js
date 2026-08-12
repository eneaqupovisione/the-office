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
      b.textContent = t.id;
      b.title = t.cosa;
      b.setAttribute('aria-pressed', String(tipoScelto === t.id));
      b.addEventListener('click', () => {
        const gia = tipoScelto === t.id;
        casa.querySelectorAll('.tipo').forEach(x => x.setAttribute('aria-pressed','false'));
        tipoScelto = gia ? null : t.id;     // ritoccarlo lo toglie: niente è obbligatorio
        if (!gia) b.setAttribute('aria-pressed','true');
        testo.focus();                       // il fuoco torna sempre al lampo
      });
      casa.appendChild(b);
    });
  }

  /* ── i progetti, come suggerimento e mai come obbligo ─────────────────── */
  function disegnaProgetti(){
    const lista = $('elenco-progetti');
    lista.innerHTML = '';
    Dati.progetti().forEach(p => {
      const o = document.createElement('option');
      o.value = p.id;
      lista.appendChild(o);
    });

    /* Le scorciatoie mostrano i cinque progetti usati più di recente: sono un
       tocco invece di dodici lettere, che sul telefono è la differenza fra
       scriverlo e saltarlo. */
    const recenti = [];
    Dati.catture().slice().reverse().forEach(r => {
      if (r.dove && !recenti.includes(r.dove) && recenti.length < 5) recenti.push(r.dove);
    });

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

    testo.value = '';
    /* Il tipo e l'appartenenza RESTANO: capita spesso di catturare due cose di
       fila sullo stesso progetto, e ributtarli ogni volta è attrito che si paga
       a ogni singola cattura. */
    aggiornaSalva();
    App.aggiorna();
    testo.focus();

    /* La cartella, se c'è, viene **dopo** il salvataggio locale e non lo
       blocca: se fallisce, la cattura è comunque al sicuro e resta «in attesa». */
    if (Ponte.collegata()){
      App.conferma('salvato');
      const fatto = await Ponte.scriviUna(r);
      App.aggiorna();
      if (fatto) App.conferma('scritto in ' + Ponte.nomeCartella());
    } else {
      App.conferma('salvato');
    }
  }

  function aggiornaSalva(){ salva.disabled = testo.value.trim() === ''; }

  function avvia(){
    disegnaTipi();
    disegnaProgetti();
    aggiornaSalva();

    testo.addEventListener('input', aggiornaSalva);
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

  return { avvia, disegnaProgetti, fuoco: () => testo.focus() };
})();
