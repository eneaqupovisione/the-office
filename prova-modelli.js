/* Le prove dei modelli incorporati. Un modello rotto non si vede subito: si
   vede fra due settimane, quando un progetto nato male ti fa perdere il conto
   delle fasi. Qui si controlla che ognuno sia un `prossimi-passi.md` valido e
   che regga i gesti che l'app gli farà davvero. */

const fs = require('fs');
const percorso = (f) => require('path').join(__dirname, f);
const Passi   = eval(fs.readFileSync(percorso('passi.js'), 'utf8') + '\n;Passi');
const Modelli = eval(fs.readFileSync(percorso('modelli.js'), 'utf8') + '\n;Modelli');

let ok = 0, ko = 0;
const t = (nome, cond, extra) => {
  cond ? ok++ : (ko++, console.log('  ✗ ' + nome + (extra ? '\n      ' + String(extra).slice(0, 300) : '')));
};

const tutti = Modelli.tutti();
t('c\'è almeno un modello', tutti.length > 0);

tutti.forEach(m => {
  const testo = Modelli.testoDi(m.id);
  const l = Passi.leggi(testo);
  const fasi = l.daFare.filter(v => v.rientro === 0);
  const fini = l.daFare.filter(v => v.rientro > 0);

  t(m.nome + ': ha le sezioni', l.haSezioni);
  t(m.nome + ': ha un titolo', /^# \S/m.test(testo));
  t(m.nome + ': ha un perché', !!l.perche, l.perche);
  t(m.nome + ': ha delle fasi', fasi.length >= 3, fasi.length);
  t(m.nome + ': ogni fase ha la sua nota',
    fasi.every(v => v.nota), fasi.filter(v => !v.nota).map(v => v.testo).join(', '));
  t(m.nome + ': ogni fase ha delle cose fini sotto',
    fasi.every(v => v.figli && v.figli.totali > 0), fasi.filter(v => !v.figli).map(v => v.testo).join(', '));
  t(m.nome + ': nessuna cosa fine ha figli', !fini.find(v => v.figli));
  t(m.nome + ': niente è già spuntato', l.fatte.length === 0);

  /* Il gesto che il modello subirà per primo. */
  const nato = Passi.daModello(testo, 'prova-nome', 'il mio perché');
  const ln = Passi.leggi(nato);
  t(m.nome + ': diventa un progetto col nome giusto', /^# prova-nome$/m.test(nato));
  t(m.nome + ': e col perché mio', ln.perche === 'il mio perché', ln.perche);
  t(m.nome + ': i passi arrivano tutti', ln.daFare.length === l.daFare.length);

  /* E il gesto che riceverà mille volte: spuntare. Una fase deve portarsi via
     i suoi, o l'elenco si riempie di orfani rientrati. */
  const prima = ln.daFare.filter(v => v.rientro === 0)[0];
  const dopo = Passi.spunta(nato, prima.riga, prima.testo, '2026-08-25');
  const ld = Passi.leggi(dopo);
  t(m.nome + ': spuntando una fase, niente orfani',
    !ld.daFare.find(v => v.rientro > 0 && v.riga < (ld.daFare.filter(x => x.rientro === 0)[0] || { riga: 1e9 }).riga),
    dopo.split('## Da fare')[1].split('\n').slice(0, 4).join(' | '));
  t(m.nome + ': la fase è scesa con la sua nota',
    /## Fatte[\s\S]*?- \[x\] 2026-08-25 · /.test(dopo) && dopo.split('## Fatte')[1].includes('>'));
  t(m.nome + ': una fase in meno da fare',
    ld.daFare.filter(v => v.rientro === 0).length === fasi.length - 1);
});

console.log('\n  ' + tutti.map(m => m.nome + ' (' +
  Passi.leggi(Modelli.testoDi(m.id)).daFare.filter(v => v.rientro === 0).length + ' fasi)').join(' · '));
console.log('  ' + ok + ' passate' + (ko ? ', ' + ko + ' FALLITE' : ''));
process.exit(ko ? 1 : 0);
