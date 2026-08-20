/* ═══════════════════════════════════════════════════════════════════════════
   IL PORTIERE — l'unico pezzo di questo progetto che gira su un server.

   Esiste per una ragione sola: **il token GitHub non può stare sul
   dispositivo.** Vive qui, in una variabile d'ambiente di Netlify, e da qui
   scrive nel repo privato `the-knowledge`. Il telefono non lo vede mai.

   È deliberatamente stupido: **non conosce il formato di una cattura.** Riceve
   un percorso e un contenuto già composti dall'app e li scrive. Il formato lo
   costruisce `ponte.js`, in un posto solo — se vivesse anche qui, due copie
   divergerebbero.

   Ed è deliberatamente corto. Il piano B, se Netlify sparisce, è spostarlo su
   una macchina Oracle: resta trasportabile in un pomeriggio
   finché non ha dipendenze e sta sotto un centinaio di righe. Se un giorno
   servisse un `package.json`, il piano B è già morto senza che nessuno lo dica.
   ═══════════════════════════════════════════════════════════════════════ */

const REPO = process.env.REPO_ALBERO || 'eneaqupovisione/the-knowledge';
const RAMO = process.env.RAMO_ALBERO || 'main';

const risposta = (stato, corpo) => ({
  statusCode: stato,
  headers: { 'content-type': 'application/json; charset=utf-8' },
  body: JSON.stringify(corpo)
});

/* Un percorso che arriva da fuori non è mai fidato. Qui dentro può stare solo
   una cattura in `_inbox/`: niente risalite, niente barre iniziali, niente
   nomi strani. Senza questo controllo la funzione scriverebbe **ovunque** nel
   repo, e sarebbe un difetto peggiore di non averla. */
function percorsoAmmesso(p){
  if (typeof p !== 'string' || !p || p.length > 200) return null;
  if (p.includes('..') || p.startsWith('/') || p.includes('\\')) return null;
  if (!/^[A-Za-z0-9._\/-]+$/.test(p)) return null;
  const pezzi = p.split('/').filter(Boolean);
  if (pezzi.length > 3) return null;              // progetto/media/file, non di più
  if (pezzi.some(x => x.startsWith('.'))) return null;
  return '_inbox/' + pezzi.join('/');
}

exports.handler = async (evento) => {
  if (evento.httpMethod !== 'POST') return risposta(405, { errore: 'solo POST' });

  const chiave = process.env.CHIAVE_APP;
  const token  = process.env.GITHUB_TOKEN;
  if (!chiave || !token)
    return risposta(500, { errore: 'la funzione non è configurata: mancano CHIAVE_APP o GITHUB_TOKEN' });

  /* La chiave d'app non è il token: se trapela, chi la trova può aggiungere
     file in `_inbox/` e nient'altro, e tu la cambi in dieci secondi. Il token
     resta di qua e non esce mai. */
  if (evento.headers['x-chiave'] !== chiave)
    return risposta(401, { errore: 'chiave mancante o sbagliata' });

  let corpo;
  try { corpo = JSON.parse(evento.body || '{}'); }
  catch (e) { return risposta(400, { errore: 'corpo non leggibile' }); }

  const percorso = percorsoAmmesso(corpo.percorso);
  if (!percorso) return risposta(400, { errore: 'percorso non ammesso' });
  if (typeof corpo.contenuto !== 'string' || !corpo.contenuto)
    return risposta(400, { errore: 'contenuto mancante' });

  /* `contenuto` arriva già in base64: vale sia per il testo sia per un
     allegato, e l'API di GitHub vuole comunque quello. */
  const url = 'https://api.github.com/repos/' + REPO + '/contents/' + encodeURI(percorso);
  const invio = {
    message: 'the-office: ' + percorso.replace('_inbox/', ''),
    content: corpo.contenuto,
    branch: RAMO
  };

  try{
    const r = await fetch(url, {
      method: 'PUT',
      headers: {
        authorization: 'Bearer ' + token,
        accept: 'application/vnd.github+json',
        'content-type': 'application/json',
        'user-agent': 'the-office'
      },
      body: JSON.stringify(invio)
    });

    if (r.status === 422)
      return risposta(409, { errore: 'esiste già un file con quel nome' });
    if (!r.ok){
      const t = await r.text();
      return risposta(502, { errore: 'GitHub ha risposto ' + r.status, dettaglio: t.slice(0, 300) });
    }
    const dati = await r.json();
    return risposta(200, { scritto: percorso, commit: dati.commit && dati.commit.sha });
  } catch (e){
    return risposta(502, { errore: 'non sono riuscito a parlare con GitHub' });
  }
};
