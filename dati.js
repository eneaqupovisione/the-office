/* ═══════════════════════════════════════════════════════════════════════════
   IL MAGAZZINO — modello, lettura, scrittura.

   Local-first per decisione scritta nel nodo: si scrive subito in locale, la
   sincronizzazione viene dopo. Qui dentro non c'è **nessuna chiamata di rete**
   e nessun segreto, e nel percorso del salvataggio non devono comparirne mai:
   se la scrittura aspetta la rete, i cinque secondi sono già persi.

   `localStorage` e non IndexedDB: sono righe di testo, la scrittura è sincrona
   (quindi non può fallire a metà mentre chiudo l'app) e rileggere tutto a ogni
   salvataggio costa niente su questi volumi. Se un giorno le catture fossero
   migliaia, questa è la prima cosa da cambiare.
   ═══════════════════════════════════════════════════════════════════════ */

const Dati = (() => {

  const CHIAVE          = 'the-office.catture';
  const CHIAVE_EXPORT   = 'the-office.ultimo-export';
  const CHIAVE_PROGETTI = 'the-office.progetti';
  const CHIAVE_IMPOST   = 'the-office.impostazioni';

  /* I sei tipi di METODO.md §6, più `contatto` che è in prova: introdotto
     parlando, non ha ancora una casa (le persone attraversano più progetti) e
     non sale nel metodo finché non dimostra di pesare. Il punto dopo
     l'etichetta lo segnala — allinearlo «per coerenza» rompe una decisione. */
  const TIPI = [
    { id:'idea',        prova:false, cosa:'da fare o esplorare, non ancora valutato' },
    { id:'passo',       prova:false, cosa:'un\'azione concreta, definita' },
    { id:'ipotesi',     prova:false, cosa:'una scommessa da verificare' },
    { id:'appunto',     prova:false, cosa:'una riflessione, un\'osservazione' },
    { id:'riferimento', prova:false, cosa:'un link, una foto, una fonte' },
    { id:'decisione',   prova:false, cosa:'ho deciso, o devo decidere' },
    { id:'contatto',    prova:true,  cosa:'una persona (in prova, non nel metodo)' },
  ];

  /* `chiaro` di base: la direzione 06 è un sistema su carta, e il grigio
     dell'interfaccia — che lì è un colore, non un neutro di servizio — esiste
     solo lì. La notte resta una scelta, non più il valore di partenza. */
  const IMPOST_DEFAULT = { tema:'chiaro', utenteGitHub:'eneaqupovisione', scrivoDaSolo:true };

  /* ── lettura e scrittura grezze ──────────────────────────────────────── */
  function leggiChiave(chiave, ripiego){
    try { return JSON.parse(localStorage.getItem(chiave)) ?? ripiego; }
    catch (e) { return ripiego; }        // meglio ripartire che perdere l'app
  }
  function scriviChiave(chiave, valore){
    try { localStorage.setItem(chiave, JSON.stringify(valore)); return true; }
    catch (e) { return false; }          // quota piena: chi chiama lo dice
  }

  /* ── le catture ──────────────────────────────────────────────────────── */
  function catture(){ return leggiChiave(CHIAVE, []); }
  function scriviCatture(righe){ return scriviChiave(CHIAVE, righe); }

  function orario(d){
    const p = (n) => String(n).padStart(2,'0');
    return d.getFullYear() + '-' + p(d.getMonth()+1) + '-' + p(d.getDate())
         + '-' + p(d.getHours()) + p(d.getMinutes());
  }

  function aggiungi({ testo, tipo, dove }){
    const corpo = (testo || '').trim();
    if (!corpo) return null;              // il testo è l'unica cosa necessaria
    const ora = new Date();
    const r = {
      id: Date.now() + '-' + Math.random().toString(36).slice(2,7),
      quando: ora.toISOString(),
      nome: orario(ora),
      tipo: tipo || '',
      dove: (dove || '').trim(),
      testo: corpo,
      uscita: null                        // quando e come è uscita di qui
    };
    const righe = catture();
    righe.push(r);
    if (!scriviCatture(righe)) return null;
    if (r.dove) ricorda(r.dove);          // il progetto scritto a mano si impara
    return r;
  }

  function elimina(id){
    scriviCatture(catture().filter(r => r.id !== id));
  }

  /* Si può cambiare **l'etichetta**, non il testo. «La casella è l'etichetta,
     non la destinazione»: correggere il tipo o il progetto è smistamento, e va
     fatto. Riscrivere il pensiero no — su quel terreno c'è Claude Code, e il
     nodo lo dichiara come limite del progetto. */
  function rietichetta(id, campi){
    const righe = catture();
    const r = righe.find(x => x.id === id);
    if (!r) return;
    if ('tipo' in campi) r.tipo = campi.tipo || '';
    if ('dove' in campi){ r.dove = (campi.dove || '').trim(); if (r.dove) ricorda(r.dove); }
    scriviCatture(righe);
  }

  function segnaUscite(ids, come){
    const quando = new Date().toISOString();
    const set = new Set(ids);
    const righe = catture();
    righe.forEach(r => { if (set.has(r.id)) r.uscita = { quando, come }; });
    scriviCatture(righe);
    if (come === 'esportazione') localStorage.setItem(CHIAVE_EXPORT, quando);
  }

  function inAttesa(){ return catture().filter(r => !r.uscita); }

  function svuota(){ scriviCatture([]); }

  /* ── i progetti ──────────────────────────────────────────────────────────
     Non sono una tassonomia: sono la memoria dei nomi già usati, perché
     `cantera` e `Cantera` in due catture diverse diventano due mucchi. Restano
     facoltativi in cattura, e questo non si tocca. */
  function progetti(){ return leggiChiave(CHIAVE_PROGETTI, []); }
  function scriviProgetti(p){ scriviChiave(CHIAVE_PROGETTI, p); }

  function normalizza(nome){
    return (nome || '').trim().toLowerCase().replace(/\s+/g, '-');
  }

  function ricorda(nome, fonte, url){
    const id = normalizza(nome);
    if (!id) return;
    const p = progetti();
    const gia = p.find(x => x.id === id);
    if (gia){
      if (fonte && gia.fonte !== fonte){ gia.fonte = fonte; gia.url = url || gia.url; scriviProgetti(p); }
      return;
    }
    p.push({ id, nome:id, fonte: fonte || 'locale', url: url || '' });
    scriviProgetti(p);
  }

  function dimentica(id){ scriviProgetti(progetti().filter(p => p.id !== id)); }

  function conteggi(){
    const c = {};
    catture().forEach(r => { const k = r.dove || ''; c[k] = (c[k] || 0) + 1; });
    return c;
  }

  /* ── le impostazioni ─────────────────────────────────────────────────── */
  function impostazioni(){ return Object.assign({}, IMPOST_DEFAULT, leggiChiave(CHIAVE_IMPOST, {})); }
  function imposta(campi){ scriviChiave(CHIAVE_IMPOST, Object.assign(impostazioni(), campi)); }

  /* ── il travaso dalla versione a schermata unica ─────────────────────────
     Le catture vecchie non hanno `uscita`: la si ricostruisce dalla data
     dell'ultima esportazione, che è l'unica cosa che quella versione sapeva.
     E i progetti si imparano da ciò che è già stato scritto a mano. */
  function travasa(){
    const righe = catture();
    const ultimo = localStorage.getItem(CHIAVE_EXPORT);
    let toccato = false;
    righe.forEach(r => {
      if (r.uscita === undefined){
        r.uscita = (ultimo && r.quando <= ultimo) ? { quando: ultimo, come:'esportazione' } : null;
        toccato = true;
      }
    });
    if (toccato) scriviCatture(righe);
    righe.forEach(r => { if (r.dove) ricorda(r.dove); });
  }

  return {
    TIPI, orario,
    catture, aggiungi, elimina, rietichetta, segnaUscite, inAttesa, svuota,
    progetti, ricorda, dimentica, normalizza, conteggi,
    impostazioni, imposta, travasa,
    ultimaEsportazione: () => localStorage.getItem(CHIAVE_EXPORT)
  };
})();
