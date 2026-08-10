/* ═══════════════════════════════════════════════════════════════════════════
   THE OFFICE — la cattura.
   Obiettivo unico: dal pensiero al testo salvato in meno di cinque secondi e
   nessuna decisione obbligatoria (METODO.md §1).

   Local-first per decisione scritta nel nodo: scrive subito in locale, la
   sincronizzazione viene dopo. Se aspettasse la rete a ogni tasto, i cinque
   secondi sarebbero già persi. Qui dentro non c'è nessuna chiamata di rete e
   nessun segreto — e per ora non deve essercene.
   ═══════════════════════════════════════════════════════════════════════ */

const CHIAVE = 'the-office.catture';
const CHIAVE_EXPORT = 'the-office.ultimo-export';

/* I sei tipi di METODO.md §6, più `contatto` che è in prova: introdotto
   parlando, non ha ancora una casa (le persone attraversano più progetti) e
   non sale nel metodo finché non dimostra di pesare. Il punto dopo l'etichetta
   lo segnala. */
const TIPI = [
  { id:'idea',        prova:false },
  { id:'passo',       prova:false },
  { id:'ipotesi',     prova:false },
  { id:'appunto',     prova:false },
  { id:'riferimento', prova:false },
  { id:'decisione',   prova:false },
  { id:'contatto',    prova:true  },
];

const $ = (id) => document.getElementById(id);
const testo = $('testo'), dove = $('dove'), salva = $('salva'),
      contatore = $('contatore'), conferma = $('conferma');

let tipoScelto = null;

/* ── magazzino ─────────────────────────────────────────────────────────────
   localStorage e non IndexedDB: sono righe di testo, la scrittura è sincrona
   (quindi non può fallire a metà mentre chiudo l'app), e il costo di leggere
   tutto a ogni salvataggio è irrilevante su questi volumi. Se un giorno le
   catture diventassero migliaia, questa è la prima cosa da cambiare. */
function leggi(){
  try { return JSON.parse(localStorage.getItem(CHIAVE) || '[]'); }
  catch (e) { return []; }          // meglio ripartire che perdere l'app
}
function scrivi(righe){ localStorage.setItem(CHIAVE, JSON.stringify(righe)); }

/* ── il contatore, che è sacro ───────────────────────────────────────────── */
function aggiornaContatore(){
  const n = leggi().length;
  const ultimo = localStorage.getItem(CHIAVE_EXPORT);
  contatore.textContent = n === 0
    ? (ultimo ? 'inbox vuota' : 'niente ancora')
    : n + (n === 1 ? ' in attesa' : ' in attesa');
  contatore.classList.toggle('pieno', n > 0);
}

/* ── le caselle del tipo ─────────────────────────────────────────────────── */
TIPI.forEach(t => {
  const b = document.createElement('button');
  b.type = 'button';
  b.className = 'tipo' + (t.prova ? ' prova' : '');
  b.textContent = t.id;
  b.setAttribute('aria-pressed', 'false');
  b.addEventListener('click', () => {
    const gia = tipoScelto === t.id;
    document.querySelectorAll('.tipo').forEach(x => x.setAttribute('aria-pressed','false'));
    tipoScelto = gia ? null : t.id;            // ritoccarlo lo toglie: niente è obbligatorio
    if (!gia) b.setAttribute('aria-pressed','true');
    testo.focus();                              // il fuoco torna sempre al lampo
  });
  $('tipi').appendChild(b);
});

/* ── salvare ─────────────────────────────────────────────────────────────── */
function orario(d){
  const p = (n) => String(n).padStart(2,'0');
  return d.getFullYear() + '-' + p(d.getMonth()+1) + '-' + p(d.getDate())
       + '-' + p(d.getHours()) + p(d.getMinutes());
}

function salvaCattura(){
  const corpo = testo.value.trim();
  if (!corpo) return;                           // il testo è l'unica cosa necessaria

  const righe = leggi();
  righe.push({
    id: Date.now() + '-' + Math.random().toString(36).slice(2,7),
    quando: new Date().toISOString(),
    nome: orario(new Date()),
    tipo: tipoScelto || '',
    dove: dove.value.trim(),
    testo: corpo
  });
  scrivi(righe);

  testo.value = '';
  // il tipo e l'appartenenza RESTANO: catturo spesso due cose di seguito sullo
  // stesso progetto, e ributtarli ogni volta è attrito che si paga sempre
  aggiornaContatore();
  aggiornaSalva();
  mostraConferma('salvato');
  testo.focus();
}

function mostraConferma(t){
  conferma.textContent = t;
  conferma.classList.remove('mostra');
  void conferma.offsetWidth;                    // riavvia l'animazione
  conferma.classList.add('mostra');
}

function aggiornaSalva(){ salva.disabled = testo.value.trim() === ''; }

testo.addEventListener('input', aggiornaSalva);
salva.addEventListener('click', salvaCattura);
document.addEventListener('keydown', (e) => {
  if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') { e.preventDefault(); salvaCattura(); }
});

/* ── esportare ────────────────────────────────────────────────────────────
   PONTE PROVVISORIO. Finché non esiste la sincronizzazione verso il repo, i
   file arrivano nell'inbox passando da qui. Un solo file con dentro tutte le
   catture, ognuna con la sua intestazione e un separatore riconoscibile: lo
   smistamento lo spezza in file veri. Scaricarne uno per cattura non si può —
   i browser bloccano i download multipli — e chiedere un gesto per riga
   sarebbe peggio del problema. */
function componiEsportazione(righe){
  const visti = {};
  const pezzi = righe.map(r => {
    let nome = r.nome;
    visti[nome] = (visti[nome] || 0) + 1;
    if (visti[nome] > 1) nome += '-' + visti[nome];   // due lampi nello stesso minuto

    const testa = ['---'];
    if (r.tipo) testa.push('tipo: ' + r.tipo);
    if (r.dove) testa.push('progetto: ' + r.dove);
    testa.push('origine: the-office');
    testa.push('stato: da-smistare');
    testa.push('---');

    return '=== _inbox/' + nome + '.md ===\n' + testa.join('\n') + '\n\n' + r.testo + '\n';
  });

  return '# Catture da The Office\n'
       + '# ' + righe.length + ' oggetti · esportati il ' + new Date().toISOString().slice(0,16).replace('T',' ') + '\n'
       + '#\n'
       + '# Ogni blocco delimitato da tre segni di uguale è un file separato.\n'
       + '# Lo smistamento li spezza e li scrive in ~/the-knowledge/_inbox/.\n'
       + '# (Qui sopra il separatore non è scritto per esteso di proposito:\n'
       + '#  comparirebbe come un blocco finto al primo che divide il file.)\n\n'
       + pezzi.join('\n');
}

$('esporta').addEventListener('click', () => {
  const righe = leggi();
  if (!righe.length) { mostraConferma('niente da esportare'); return; }

  const blob = new Blob([componiEsportazione(righe)], { type:'text/markdown' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'catture-' + orario(new Date()) + '.md';
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);

  localStorage.setItem(CHIAVE_EXPORT, new Date().toISOString());
  mostraConferma(righe.length + ' esportati');
  aggiornaContatore();
});

/* ── svuotare ─────────────────────────────────────────────────────────────
   L'unico gesto distruttivo dell'app, quindi: conferma esplicita, e un
   avvertimento se c'è roba mai esportata. Perdere una cattura è la cosa che
   questo sistema esiste per impedire. */
$('svuota').addEventListener('click', () => {
  const righe = leggi();
  if (!righe.length) { mostraConferma('già vuota'); return; }

  const ultimo = localStorage.getItem(CHIAVE_EXPORT);
  const mai = !ultimo || righe.some(r => r.quando > ultimo);
  const avviso = mai
    ? '\n\n⚠️ Ci sono catture MAI esportate. Andrebbero perse per sempre.'
    : '';

  if (confirm('Cancellare ' + righe.length + ' catture da questo dispositivo?' + avviso)) {
    scrivi([]);
    aggiornaContatore();
    mostraConferma('svuotata');
  }
});

/* ── funziona anche senza rete ───────────────────────────────────────────── */
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
}

aggiornaContatore();
aggiornaSalva();
