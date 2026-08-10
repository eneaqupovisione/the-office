# The Office

**Dal pensiero al testo salvato in meno di cinque secondi, e nessuna decisione
obbligatoria.** È l'unico obiettivo, e tutto il resto gli è subordinato.

La porta di [The Knowledge](https://github.com/eneaqupovisione/the-knowledge).
Il *perché* esiste sta nel suo nodo: `~/the-knowledge/prodotti/the-office/README.md`.

---

## Provarla, adesso

```bash
open ~/Desktop/the-office/index.html
```

Non serve nient'altro: nessun `npm`, nessuna costruzione, nessun account. Si apre
il file e funziona.

Il percorso completo è: **apri → scrivi → ⌘+invio.** Il campo del testo ha il
fuoco all'apertura, e nessun altro campo è obbligatorio.

## Metterla sul telefono

Serve un indirizzo `https` — un file locale non si installa. Da rete locale, per
provarla oggi:

```bash
cd ~/Desktop/the-office && python3 -m http.server 8000
```

poi dal telefono, sulla stessa rete, `http://<ip-del-mac>:8000`. In questo modo
si vede e si usa, ma **non si installa**: l'aggiunta alla schermata home vuole
`https`. Quello arriva con la pubblicazione.

## Come si usa

| | |
|---|---|
| **Scrivi** | il campo è già pronto. Il testo è l'unica cosa necessaria |
| **Il tipo** | un tocco, facoltativo. Ritoccalo per toglierlo |
| **Di chi è** | facoltativo, alla precisione che hai in quel momento: niente, un dominio, o un progetto |
| **Salva** | il pulsante, oppure ⌘/Ctrl + invio |
| **Il contatore** | in alto a destra, sempre. Dice quanti oggetti aspettano |

Tipo e appartenenza **restano** dopo il salvataggio: capita spesso di catturare
due cose di fila sullo stesso progetto.

## Portare le catture nell'inbox

`esporta per l'inbox` scarica un file `.md` con dentro tutte le catture, ognuna
già con la sua intestazione e separata dalle altre. Poi, in una sessione di
Claude Code dentro `~/the-knowledge`:

> «smista l'inbox» — dopo aver spezzato il file esportato in `_inbox/`

**È un ponte provvisorio**, non una funzione: sparisce quando esisterà la
sincronizzazione col repo. Il perché sta in
[`decisioni/`](decisioni/2026-08-10-la-prima-fetta-e-solo-la-cattura.md).

## Cosa c'è e cosa non c'è

✅ La cattura — la funzione 1 delle tre previste
🔲 La vista trasversale delle scadenze — non esiste
🔲 Il ritorno sulle idee vecchie — non esiste
🔲 La sincronizzazione col repo — non esiste, e finché non c'è **telefono e
computer restano due mucchi separati**

Le trappole note stanno in [`trappole.md`](trappole.md). La prima vale la pena
leggerla prima di fidarsi dell'app per qualcosa di importante.
