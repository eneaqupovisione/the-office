/* Le domande della Bacheca, provate da sole.

   `domande.js` non tocca il DOM apposta: quello che decide **cosa ti viene
   messo davanti** è la parte che non deve sbagliare, e provarla aprendo il
   browser e guardando vorrebbe dire non provarla mai.

       node prova-domande.js
*/

const fs = require('fs');
const Domande = eval(fs.readFileSync(require('path').join(__dirname, 'domande.js'), 'utf8') + '\n;Domande');

let ok = 0, ko = 0;
const t = (nome, cond, extra) => { cond ? ok++ : (ko++, console.log('  ✗ ' + nome + (extra ? '\n      ' + String(extra).replace(/\n/g, '\n      ') : ''))); };

const GIORNO = 86400000;
const ADESSO = new Date('2026-08-23T12:00:00Z').getTime();
const faGiorni = (g) => ADESSO - g * GIORNO;

const mossa = (testo) => ({ file: 'prossimi-passi.md', riga: 0, testo, sua: true });

/* Un campionario che somiglia a `~/Lavori`: uno vivo, uno sepolto, uno
   sepolto da moltissimo, uno che aspetta qualcuno, uno chiuso. */
const ELENCO = [
  { nome: 'sito', percorso: 'bottega/sito', quando: faGiorni(2),
    per: 'Bottega Marconi', entro: '2026-08-29',
    mosse: [mossa('i testi definitivi'), mossa('mandare la bozza')],
    idee: [{ riga: 3, testo: 'una pagina sola invece di quattro' }] },

  { nome: 'faro', percorso: 'faro', quando: faGiorni(120),
    per: '', entro: '',
    mosse: [mossa('rileggere gli appunti')],
    idee: [{ riga: 4, testo: 'il generatore di copertine' }] },

  { nome: 'tramonto', percorso: 'tramonto', quando: faGiorni(65),
    per: '', entro: '',
    mosse: [mossa('decidere se ha senso')],
    idee: [] },

  { nome: 'demo', percorso: 'cartolina/demo', quando: faGiorni(11),
    per: 'Hotel Riva', entro: '2026-08-14',
    mosse: [mossa('scrivere le due righe'), mossa('mandarla')],
    idee: [{ riga: 5, testo: 'la disponibilità vera' }] },

  { nome: 'sepolto', percorso: 'vecchio/sepolto', quando: faGiorni(200),
    per: 'Qualcuno', entro: '', chiuso: '2026-01-10',
    mosse: [mossa('niente, è chiuso')], idee: [] }
];

const mai = () => false;
const ctx = (via, giaVisti) => ({ adesso: ADESSO, via: via || mai, giaVisti: giaVisti || new Set() });
const testi = (r) => r.proposte.map(x => x.testo);

/* ── 1 · la mossa di un progetto ────────────────────────────────────────── */

const sito = ELENCO[0];
t('mosseDi: le prende dall\'elenco', Domande.mosseDi(sito).length === 2);
t('mosseDi: ripiega sulla mossa sola', Domande.mosseDi({ mossa: mossa('x') }).length === 1);
t('mosseDi: nessuna mossa, nessun errore', Domande.mosseDi({}).length === 0);
t('mosseDi: nemmeno su niente', Domande.mosseDi(null).length === 0);

t('mossaDi: la prima', Domande.mossaDi(sito, mai).testo === 'i testi definitivi');

const viaLaPrima = (k) => k === Domande.chiaveDi('mossa', sito, 'i testi definitivi');
t('mossaDi: messa via la prima, arriva la seconda',
  Domande.mossaDi(sito, viaLaPrima).testo === 'mandare la bozza');

const viaTutte = () => true;
t('mossaDi: messe via tutte, nessuna', Domande.mossaDi(sito, viaTutte) === null);

/* ── 2 · la chiave ──────────────────────────────────────────────────────── */

t('la chiave porta il percorso',
  Domande.chiaveDi('mossa', sito, 'x').indexOf('bottega/sito') > -1);
t('un\'idea e una mossa con le stesse parole non si confondono',
  Domande.chiaveDi('mossa', sito, 'x') !== Domande.chiaveDi('idea', sito, 'x'));
t('la chiave non dipende dal numero di riga',
  Domande.chiaveDi('mossa', { percorso: 'a' }, 'x') === Domande.chiaveDi('mossa', { percorso: 'a', riga: 99 }, 'x'));

/* ── 3 · cosa sto dimenticando ──────────────────────────────────────────── */

let r = Domande.chiedi('dimentico', ELENCO, ctx());
t('dimentico: il più silenzioso per primo', testi(r)[0] === 'niente, è chiuso', testi(r).join(' | '));
t('dimentico: poi a scendere', testi(r)[1] === 'rileggere gli appunti', testi(r).join(' | '));
t('dimentico: taglia a tre', r.proposte.length === Domande.QUANTE);
t('dimentico: ma dice quante sono davvero', r.quante === 5, String(r.quante));

/* Quello che è già in Bacheca non ricompare qui sotto: una risposta che ti
   rimostra quello che stai guardando non è una risposta. */
const inBacheca = new Set([Domande.chiaveDi('mossa', ELENCO[1], 'rileggere gli appunti')]);
r = Domande.chiedi('dimentico', ELENCO, ctx(mai, inBacheca));
t('dimentico: quello in bacheca esce',
  testi(r).indexOf('rileggere gli appunti') === -1, testi(r).join(' | '));

/* «chi sta aspettando» invece **non** nasconde quello che è in bacheca: chi
   aspetta aspetta, e rispondere «nessuno» mentre uno è scaduto sarebbe falso. */
const demoInBacheca = new Set([Domande.chiaveDi('mossa', ELENCO[3], 'scrivere le due righe')]);
r = Domande.chiedi('aspetta', ELENCO, ctx(mai, demoInBacheca));
t('aspetta: quello in bacheca resta',
  testi(r).indexOf('scrivere le due righe') > -1, testi(r).join(' | '));

/* Messa via la prima mossa di un progetto, la domanda propone la successiva —
   non salta il progetto. */
r = Domande.chiedi('dimentico', ELENCO, ctx(viaLaPrima));
t('dimentico: rimandata una, arriva la successiva dello stesso progetto',
  testi(r).indexOf('mandare la bozza') > -1 || Domande.mossaDi(sito, viaLaPrima).testo === 'mandare la bozza');

/* Messo via tutto, la risposta è vuota e non è un errore. */
r = Domande.chiedi('dimentico', ELENCO, ctx(viaTutte));
t('dimentico: rimandato tutto, nessuna proposta', r.proposte.length === 0);
t('dimentico: e ha una frase per il vuoto', !!r.domanda.vuoto);

/* ── 4 · che idee avevo avuto ───────────────────────────────────────────── */

r = Domande.chiedi('idee', ELENCO, ctx());
t('idee: le raccoglie da tutti i progetti', r.quante === 3, String(r.quante));
t('idee: prima quelle dei progetti più silenziosi',
  testi(r)[0] === 'il generatore di copertine', testi(r).join(' | '));
t('idee: sono marcate come idee', r.proposte.every(x => x.tipo === 'idea'));
t('idee: un progetto senza idee non rompe niente',
  Domande.chiedi('idee', [{ nome: 'a', percorso: 'a', quando: ADESSO }], ctx()).proposte.length === 0);

/* ── 5 · chi sta aspettando ─────────────────────────────────────────────── */

r = Domande.chiedi('aspetta', ELENCO, ctx());
t('aspetta: solo chi ha un «per»', r.quante === 2, String(r.quante));
t('aspetta: il chiuso non aspetta più nessuno',
  r.proposte.every(x => x.p.nome !== 'sepolto'), testi(r).join(' | '));
t('aspetta: la data più vicina per prima',
  r.proposte[0].p.nome === 'demo', r.proposte.map(x => x.p.nome).join(' | '));
t('aspetta: dice chi aspetta', r.proposte[0].sotto.indexOf('Hotel Riva') === 0, r.proposte[0].sotto);

const senzaData = [{ nome: 'z', percorso: 'z', quando: faGiorni(3), per: 'Tizio', entro: '', mosse: [mossa('m')] },
                   { nome: 'y', percorso: 'y', quando: faGiorni(3), per: 'Caio', entro: '2026-09-01', mosse: [mossa('n')] }];
r = Domande.chiedi('aspetta', senzaData, ctx());
t('aspetta: chi non ha una data va in fondo',
  r.proposte[0].p.nome === 'y', r.proposte.map(x => x.p.nome).join(' | '));

/* ── 6 · la macchina delle domande ──────────────────────────────────────── */

t('una domanda che non esiste non rompe niente', Domande.chiedi('inventata', ELENCO, ctx()) === null);
t('un elenco vuoto non rompe niente', Domande.chiedi('dimentico', [], ctx()).proposte.length === 0);
t('nessun elenco non rompe niente', Domande.chiedi('dimentico', null, ctx()).proposte.length === 0);
t('le domande hanno tutte parola, vuoto e trova',
  Domande.DOMANDE.every(d => d.id && d.parola && d.vuoto && typeof d.trova === 'function'));
t('ogni proposta ha una chiave',
  Domande.DOMANDE.every(d => Domande.chiedi(d.id, ELENCO, ctx()).proposte.every(x => !!x.chiave && !!x.p)));

/* ── ─────────────────────────────────────────────────────────────────── */

console.log('\n  ' + ok + ' passate, ' + ko + ' fallite\n');
process.exit(ko ? 1 : 0);
