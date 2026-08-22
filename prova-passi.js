const fs = require('fs');
const Passi = eval(fs.readFileSync(require('path').join(__dirname,'passi.js'), 'utf8') + '\n;Passi');

let ok = 0, ko = 0;
const t = (nome, cond, extra) => { cond ? ok++ : (ko++, console.log('  ✗ ' + nome + (extra ? '\n      ' + String(extra).replace(/\n/g,'\n      ') : ''))); };

/* ── 1 · un file nuovo si rilegge da sé ─────────────────────────────────── */
let md = Passi.nuovo('sommelier-engine');
let l = Passi.leggi(md);
t('nuovo: nessun passo', l.daFare.length === 0);
t('nuovo: nessuna fatta', l.fatte.length === 0);
t('nuovo: ha le sezioni', l.haSezioni);

/* ── 2 · aggiungere, spuntare, ritrovare ────────────────────────────────── */
md = Passi.aggiungiPasso(md, 'collegare il motore al corpus');
md = Passi.aggiungiPasso(md, 'funzioni mancanti: valida, racconta, carta');
l = Passi.leggi(md);
t('due passi aggiunti', l.daFare.length === 2, l.daFare.map(v=>v.testo).join(' | '));
t('ordine di scrittura rispettato', l.daFare[0].testo === 'collegare il motore al corpus');

md = Passi.spunta(md, l.daFare[0].riga, l.daFare[0].testo, '2026-08-21');
l = Passi.leggi(md);
t('dopo la spunta: uno da fare', l.daFare.length === 1, l.daFare.map(v=>v.testo).join(' | '));
t('dopo la spunta: una fatta', l.fatte.length === 1);
t('la fatta ha la data', l.fatte[0].data === '2026-08-21', JSON.stringify(l.fatte[0]));
t('la fatta ha il testo pulito', l.fatte[0].testo === 'collegare il motore al corpus');
t('la fatta è sotto ## Fatte', md.indexOf('## Fatte') < md.indexOf('collegare il motore'));
t('non è rimasta anche sopra', (md.match(/collegare il motore/g) || []).length === 1);

/* ── 3 · il ripensamento ────────────────────────────────────────────────── */
let md2 = Passi.despunta(md, l.fatte[0].riga, l.fatte[0].testo);
let l2 = Passi.leggi(md2);
t('despunta: torna da fare', l2.daFare.length === 2, l2.daFare.map(v=>v.testo).join(' | '));
t('despunta: niente fatte', l2.fatte.length === 0);
t('despunta: la data sparisce', !/2026-08-21/.test(md2));

/* ── 4 · le idee, e la promozione ───────────────────────────────────────── */
md = Passi.aggiungiIdea(md, 'il menu che cambia con l\'ora');
l = Passi.leggi(md);
t('idea aggiunta', l.idee.length === 1, JSON.stringify(l.idee));
t('un\'idea non è una cosa da fare', l.daFare.length === 1);
md = Passi.promuoviIdea(md, l.idee[0].riga, l.idee[0].testo);
l = Passi.leggi(md);
t('promossa: niente più idee', l.idee.length === 0);
t('promossa: due da fare', l.daFare.length === 2, l.daFare.map(v=>v.testo).join(' | '));
t('promossa: è una casella vera', /- \[ \] il menu che cambia/.test(md));

/* ── 5 · il perché ──────────────────────────────────────────────────────── */
md = Passi.scriviPerche(md, 'un sommelier che non ti fa sentire ignorante');
l = Passi.leggi(md);
t('perché scritto', l.perche === 'un sommelier che non ti fa sentire ignorante', l.perche);
md = Passi.scriviPerche(md, 'cambiato idea');
t('perché riscritto, non duplicato', (md.match(/^>/gm) || []).length === 1);

/* ── 6 · la guardia: la riga non è più quella ───────────────────────────── */
const prima = md;
t('spunta rifiutata se il testo non combacia',
  Passi.spunta(md, Passi.leggi(md).daFare[0].riga, 'una cosa che non c\'è') === prima);
t('elimina rifiutata se il testo non combacia',
  Passi.elimina(md, Passi.leggi(md).daFare[0].riga, 'nemmeno questa') === prima);

/* ── 7 · un file scritto a mano, senza le nostre sezioni ────────────────── */
const consegna = [
  '# Consegna',
  '',
  'Il sito è pronto quando tutte queste sono vere.',
  '',
  '- [ ] **1 · Mobile-first per davvero.** Aperto a 375px',
  '- [x] **2 · Sotto 2 secondi** su rete mediocre',
  '',
  '| colonna | altra |',
  '|---|---|',
  '| a | b |'
].join('\n');
const lc = Passi.leggi(consegna);
t('file altrui: legge le caselle aperte', lc.daFare.length === 1, JSON.stringify(lc.daFare));
t('file altrui: legge le fatte', lc.fatte.length === 1);
t('file altrui: sa che non ha le nostre sezioni', !lc.haSezioni);

const spuntato = Passi.spuntaSulPosto(consegna, lc.daFare[0].riga, true, lc.daFare[0].testo);
t('sul posto: la riga cambia', /- \[x\] \*\*1 · Mobile-first/.test(spuntato));
t('sul posto: nessuna riga si sposta', spuntato.split('\n').length === consegna.split('\n').length);
t('sul posto: la tabella è intatta', spuntato.includes('| colonna | altra |'));
t('sul posto: la prosa è intatta', spuntato.includes('Il sito è pronto quando tutte queste sono vere.'));

/* ── 8 · aggiungere a un file senza sezioni le crea in fondo ────────────── */
const cresciuto = Passi.aggiungiPasso(consegna, 'una cosa nuova');
t('sezione creata in fondo', /## Da fare\n\n- \[ \] una cosa nuova/.test(cresciuto), cresciuto.slice(-80));
t('il file di prima è ancora tutto lì', cresciuto.startsWith(consegna.slice(0, 60)));


/* ── 9 · i tre campi in cima ────────────────────────────────────────────── */
let f = Passi.nuovo('demo');
t('nuovo: nessun campo', !Passi.leggi(f).entro && !Passi.leggi(f).per);
f = Passi.scriviCampo(f, 'entro', '2026-09-05');
t('front matter creato in cima', f.startsWith('---\nentro: 2026-09-05\n---\n'), f.slice(0,60));
t('entro si rilegge', Passi.leggi(f).entro === '2026-09-05');
t('il titolo e il resto sopravvivono', /# demo/.test(f) && /## Da fare/.test(f));
f = Passi.scriviCampo(f, 'per', 'Hotel Riva');
t('secondo campo aggiunto, non duplicato', (f.match(/^---$/gm)||[]).length === 2, f.slice(0,80));
t('tutti e due si rileggono', Passi.leggi(f).per === 'Hotel Riva' && Passi.leggi(f).entro === '2026-09-05');
f = Passi.scriviCampo(f, 'entro', '2026-10-01');
t('entro si aggiorna, non si accumula', (f.match(/entro:/g)||[]).length === 1 && Passi.leggi(f).entro === '2026-10-01');
f = Passi.scriviCampo(f, 'entro', '');
t('entro tolto', !Passi.leggi(f).entro && Passi.leggi(f).per === 'Hotel Riva');
f = Passi.scriviCampo(f, 'per', '');
t('tolto l\'ultimo campo, sparisce il blocco', !/^---$/m.test(f), f.slice(0,40));

/* le caselle continuano a funzionare con il front matter davanti */
let g = Passi.scriviCampo(Passi.aggiungiPasso(Passi.nuovo('demo'), 'una mossa'), 'entro', '2026-09-05');
let lg = Passi.leggi(g);
t('con il front matter, il passo si legge', lg.daFare.length === 1 && lg.daFare[0].testo === 'una mossa');
g = Passi.spunta(g, lg.daFare[0].riga, lg.daFare[0].testo, '2026-08-21');
lg = Passi.leggi(g);
t('con il front matter, la spunta va al posto giusto', lg.fatte.length === 1 && lg.daFare.length === 0, g);
t('il front matter e\' intatto', Passi.leggi(g).entro === '2026-09-05');

/* ── 10 · quanto manca ──────────────────────────────────────────────────── */
const adesso = new Date('2026-08-21T12:00:00');
t('scadenza futura', Passi.scadenza('2026-08-27', adesso).testo === 'fra 6 giorni');
t('scadenza oggi', Passi.scadenza('2026-08-21', adesso).testo === 'oggi');
t('scadenza passata', Passi.scadenza('2026-08-12', adesso).testo === 'scaduta da 9 giorni');
t('scaduta e\' marcata', Passi.scadenza('2026-08-12', adesso).scaduta === true);
t('data storta = niente scadenza', Passi.scadenza('boh', adesso) === null);

console.log((ko ? '\n' : '') + ok + ' prove passate' + (ko ? ', ' + ko + ' FALLITE' : ''));
process.exit(ko ? 1 : 0);
