/* Una maniglia finta che parla come una FileSystemDirectoryHandle vera, ma
   sotto ha il disco. Serve a far attraversare a `radice.js` la ~/Lavori vera. */
const fs = require('fs'), path = require('path');

function cartella(p){
  return {
    kind: 'directory', name: path.basename(p),
    async queryPermission(){ return 'granted'; },
    async requestPermission(){ return 'granted'; },
    async *entries(){
      for (const n of fs.readdirSync(p)){
        const q = path.join(p, n);
        let st; try { st = fs.lstatSync(q); } catch(e){ continue; }
        if (st.isSymbolicLink()) continue;
        yield [n, st.isDirectory() ? cartella(q) : file(q)];
      }
    },
    async getDirectoryHandle(n){
      const q = path.join(p, n);
      if (!fs.existsSync(q) || !fs.statSync(q).isDirectory()) throw new Error('no');
      return cartella(q);
    },
    async getFileHandle(n){
      const q = path.join(p, n);
      if (!fs.existsSync(q) || !fs.statSync(q).isFile()) throw new Error('no');
      return file(q);
    }
  };
}
function file(p){
  return {
    kind: 'file', name: path.basename(p),
    async getFile(){
      const st = fs.statSync(p);
      return { lastModified: st.mtimeMs, async text(){ return fs.readFileSync(p, 'utf8'); } };
    }
  };
}

global.indexedDB = undefined;
const Passi = eval(fs.readFileSync(require('path').join(__dirname,'passi.js'), 'utf8') + '\n;Passi');
const Radice = eval(fs.readFileSync(require('path').join(__dirname,'radice.js'), 'utf8') + '\n;Radice');
Radice.attacca(cartella(require('path').join(__dirname, '..')));

const giorni = (ms) => Math.floor((Date.now() - ms) / 86400000);

(async () => {
  const t0 = Date.now();
  const lavori = await Radice.scandaglia();
  const durata = Date.now() - t0;

  /* Lo stesso filtro dell'elenco (ufficio.js · daMostrare): i progetti che hai
     dichiarato, e per i lavori dove non ne hai dichiarato nessuno una riga sola. */
  const tutti = [];
  lavori.forEach(l => {
    const dich = l.progetti.filter(p => p.dichiarato);
    if (dich.length) tutti.push(...dich);
    else tutti.push(Object.assign({}, l, { dentro: null }));
  });
  tutti.sort((a,b) => (b.quando||0) - (a.quando||0));

  console.log('L\'ELENCO, primo giorno — ' + tutti.length + ' righe\n');
  console.log('  riga                            tace   dafare fatte');
  tutti.forEach(p => {
    const dove = (p.dentro ? p.dentro + '/' : '') + p.nome;
    console.log('  ' + dove.padEnd(32)
      + String(giorni(p.quando)).padStart(4) + 'g'
      + String(p.aperte).padStart(7) + String(p.fatte).padStart(6)
      + (p.troncato ? '  (troncato)' : ''));
  });
  const nascosti = lavori.flatMap(l => l.progetti).length + lavori.length - tutti.length;
  console.log('\n  scandaglio: ' + durata + ' ms · ' + lavori.length + ' cartelle di lavoro · '
    + nascosti + ' cartelle NON messe nell\'elenco (si vedono aprendo il lavoro)');

  const urbyL = lavori.find(l => l.nome === 'urby');
  console.log('\n  aprendo urby si vedono le sue cartelle:');
  urbyL.progetti.filter(p => p.dentro).forEach(p =>
    console.log('      ' + p.nome.padEnd(24) + String(giorni(p.quando)).padStart(4) + 'g   ' + p.tipo));

  /* Il caso che ha motivato tutto il modello. */
  const urby = tutti.find(p => p.nome === 'urby');
  const food = lavori.find(l => l.nome==='urby').progetti.find(p => p.nome === 'food-cost-urby');
  console.log('\n  urby (radice) tace da ' + giorni(urby.quando) + 'g · '
    + 'food-cost-urby tace da ' + giorni(food.quando) + 'g'
    + (giorni(food.quando) > giorni(urby.quando) ? '  ✅ il figlio sepolto non e\' nascosto dal padre vivo'
                                                 : '  ✗ il padre sta mascherando il figlio'));

  /* Le caselle si aprono davvero? */
  const sito = lavori.find(l=>l.nome==='sol-y-mar').progetti.find(p => p.nome === 'sito');
  const altrove = await Radice.caselleAltrove(sito.percorso, false);
  const somma = altrove.reduce((n,f) => n + f.voci.length, 0);
  console.log('\n  sol-y-mar/sito: l\'elenco dice ' + sito.aperte + ' da fare, '
    + 'la scheda ne apre ' + somma + ' in ' + altrove.length + ' file'
    + (somma === sito.aperte ? '  ✅ il numero non promette cose che non ci sono' : '  ✗ il conto non torna'));
  altrove.forEach(f => console.log('      ' + f.file + ' — ' + f.voci.length));
})();
