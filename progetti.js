/* ═══════════════════════════════════════════════════════════════════════════
   I PROGETTI — la memoria dei nomi, non una tassonomia.

   Servono a una cosa sola: che `cantera`, `Cantera` e `cantera ` non diventino
   tre mucchi diversi. **L'appartenenza resta facoltativa in cattura**, e questo
   non si tocca: il primo principio del metodo è che la cattura non chiede
   permesso.

   ── La rete ──────────────────────────────────────────────────────────────
   La lettura dei repo pubblici di GitHub è **l'unico punto dell'app che tocca
   la rete**, sta dietro un gesto esplicito e non c'è **nessun token**: legge
   solo ciò che è già pubblico. Se un giorno qualcuno volesse leggere repo
   privati, servirebbe un segreto — e allora la strada è la funzione lato
   server, mai una chiave qui dentro (CLAUDE.md §3, «una chiave finita qui è
   pubblica per sempre»).
   ═══════════════════════════════════════════════════════════════════════ */

const Progetti = (() => {

  const $ = (id) => document.getElementById(id);
  let repoLetti = [];

  function disegna(){
    const casa = $('elenco-progetti-ui');
    casa.innerHTML = '';
    const conti = Dati.conteggi();
    const elenco = Dati.progetti();

    if (!elenco.length){
      const v = document.createElement('p');
      v.className = 'esito';
      v.textContent = 'Nessuno ancora. Si imparano da soli: il primo progetto che scrivi in cattura finisce qui.';
      casa.appendChild(v);
    }

    elenco.forEach(p => {
      const riga = document.createElement('div');
      riga.className = 'progetto';

      const nome = document.createElement('span');
      nome.className = 'progetto-nome'; nome.textContent = p.id;
      riga.appendChild(nome);

      if (p.forma){
        const fo = document.createElement('span');
        fo.className = 'progetto-forma'; fo.textContent = p.forma;
        riga.appendChild(fo);
      }
      if (p.fonte && p.fonte !== 'locale'){
        const f = document.createElement('span');
        f.className = 'progetto-fonte'; f.textContent = p.fonte;
        riga.appendChild(f);
      }

      const conto = document.createElement('span');
      conto.className = 'progetto-conto';
      conto.textContent = (conti[p.id] || 0) + ' catture';
      riga.appendChild(conto);

      const togli = document.createElement('button');
      togli.type = 'button'; togli.className = 'progetto-togli';
      togli.textContent = '×'; togli.title = 'Togli dai suggerimenti';
      togli.setAttribute('aria-label', 'Togli ' + p.id);
      togli.addEventListener('click', () => {
        /* Toglie il **suggerimento**, non le catture: quelle restano dove sono,
           con la loro etichetta. Cancellare dati da qui sarebbe una trappola. */
        Dati.dimentica(p.id); App.aggiorna();
      });
      riga.appendChild(togli);

      casa.appendChild(riga);
    });

    disegnaRepo();
  }

  /* ── GitHub ──────────────────────────────────────────────────────────── */
  async function leggiGitHub(utente){
    const esito = $('esito-github');
    esito.className = 'esito';
    esito.textContent = 'leggo i repo pubblici di ' + utente + '…';

    try{
      const risposta = await fetch(
        'https://api.github.com/users/' + encodeURIComponent(utente) + '/repos?per_page=100&sort=updated',
        { headers: { 'Accept':'application/vnd.github+json' } }
      );
      if (risposta.status === 404) throw new Error('utente inesistente, o nessun repo pubblico');
      if (risposta.status === 403) throw new Error('GitHub ha messo un limite alle letture: riprova fra un po\'');
      if (!risposta.ok) throw new Error('GitHub ha risposto ' + risposta.status);

      const dati = await risposta.json();
      repoLetti = dati.map(r => ({ nome: r.name, url: r.html_url, descrizione: r.description || '' }));
      Dati.imposta({ utenteGitHub: utente });

      esito.className = 'esito bene';
      esito.textContent = repoLetti.length + ' repo pubblici trovati.';
      disegnaRepo();
    } catch (e){
      repoLetti = [];
      esito.className = 'esito male';
      esito.textContent = (e && e.message && e.message !== 'Failed to fetch')
        ? e.message
        : 'non ci arrivo: serve la rete, e questa è l\'unica schermata che la usa.';
      disegnaRepo();
    }
  }

  function disegnaRepo(){
    const casa = $('elenco-repo');
    casa.innerHTML = '';
    const gia = new Set(Dati.progetti().map(p => p.id));

    repoLetti.forEach(r => {
      const id = Dati.normalizza(r.nome);
      const riga = document.createElement('div');
      riga.className = 'repo';

      const nome = document.createElement('span');
      nome.className = 'repo-nome'; nome.textContent = r.nome;
      nome.title = r.descrizione;
      riga.appendChild(nome);

      const b = document.createElement('button');
      b.type = 'button';
      if (gia.has(id)){ b.textContent = 'c\'è già'; b.disabled = true; }
      else {
        b.textContent = 'aggiungi';
        b.addEventListener('click', () => {
          Dati.ricorda(r.nome, 'github', r.url);
          App.aggiorna();
          App.conferma(id + ' aggiunto');
        });
      }
      riga.appendChild(b);
      casa.appendChild(riga);
    });
  }

  /* I progetti veri, letti dalle cartelle di `~/the-knowledge`. È la fonte
     giusta: GitHub sa dei repo, l'albero sa dei progetti — e non tutti i
     progetti hanno un repo (i clienti, per dirne uno). */
  async function leggiAlbero(){
    const esito = $('esito-albero');
    if (!Ponte.vedeLAlbero()){
      esito.className = 'esito';
      esito.textContent = Ponte.collegata()
        ? 'La cartella collegata è _inbox: da lì non si vede l\'albero. Ricollega ~/the-knowledge in Impostazioni.'
        : 'Serve la cartella collegata: si fa in Impostazioni, e vuole ~/the-knowledge.';
      return;
    }
    esito.className = 'esito';
    esito.textContent = 'leggo le cartelle dell\'albero…';
    try{
      const trovati = await Ponte.progettiVeri();
      let nuovi = 0;
      const gia = new Set(Dati.progetti().map(p => p.id));
      trovati.forEach(t => { if (!gia.has(Dati.normalizza(t.nome))) nuovi++; Dati.ricorda(t.nome, 'albero', '', t.forma); });
      App.aggiorna();
      esito.className = 'esito bene';
      esito.textContent = trovati.length + ' progetti nell\'albero'
        + (nuovi ? ', ' + nuovi + ' nuovi' : ' — c\'erano già tutti') + '.';
    } catch (e){
      esito.className = 'esito male';
      esito.textContent = 'non riesco a leggere le cartelle: ' + (e && e.message ? e.message : 'permesso negato');
    }
  }

  function avvia(){
    $('leggi-albero').addEventListener('click', leggiAlbero);
    $('utente-github').value = Dati.impostazioni().utenteGitHub || '';

    $('aggiungi-progetto').addEventListener('submit', (e) => {
      e.preventDefault();
      const campo = $('nuovo-progetto');
      const nome = Dati.normalizza(campo.value);
      if (!nome) return;
      Dati.ricorda(nome);
      campo.value = '';
      App.aggiorna();
      App.conferma(nome + ' aggiunto');
    });

    $('carica-github').addEventListener('submit', (e) => {
      e.preventDefault();
      const utente = $('utente-github').value.trim();
      if (utente) leggiGitHub(utente);
    });
  }

  return { avvia, disegna };
})();
