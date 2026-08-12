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

Per la **cartella collegata** (sotto) serve `localhost` invece del file:

```bash
cd ~/Desktop/the-office && python3 -m http.server 8000
```

poi `http://localhost:8000`.

## Le quattro schermate

Il menu sta a sinistra: fisso da 900px in su, a scomparsa sotto — si apre dal
bottone in alto e si chiude anche trascinandolo via col dito.

| | |
|---|---|
| **Cattura** | è la schermata che si apre, sempre. Scrivi, e basta |
| **Archivio** | le catture raggruppate per progetto. Si legge, si cerca, si corregge l'etichetta. **Il testo non si modifica** |
| **Progetti** | i nomi già usati, più quelli che vuoi aggiungere o leggere dai repo pubblici di GitHub |
| **Impostazioni** | il ponte verso `_inbox`, il tema, e l'elenco onesto di ciò che ancora non c'è |

### Catturare

| | |
|---|---|
| **Scrivi** | il campo è già pronto. Il testo è l'unica cosa necessaria |
| **Il tipo** | un tocco, facoltativo. Ritoccalo per toglierlo |
| **Di chi è** | facoltativo, alla precisione che hai in quel momento: niente, un dominio, o un progetto. Gli ultimi cinque progetti usati sono un tocco solo |
| **Salva** | il pulsante, oppure ⌘/Ctrl + invio |
| **Il contatore** | sempre in vista. Dice quante catture **non sono ancora uscite** da questo dispositivo |

Tipo e appartenenza **restano** dopo il salvataggio: capita spesso di catturare
due cose di fila sullo stesso progetto.

## Portare le catture nell'inbox

Due strade, e la prima è automatica.

**La cartella collegata** — computer, Chrome o Edge, da `https` o `localhost`.
In *Impostazioni → Collega la cartella* scegli `~/the-knowledge/_inbox`: da lì in
poi ogni cattura ci finisce dentro come file `.md` vero, da sola, e Claude Code
la trova senza che tu esporti niente. Il permesso si dà una volta; se il browser
lo lascia scadere, lo stato scritto nel pannello lo dice e un tocco lo rinnova.

**L'esportazione** — ovunque, telefono compreso. *Impostazioni → Esporta per
l'inbox* scarica un `.md` con dentro tutte le catture in attesa, ognuna già con
la sua intestazione e separata dalle altre. Poi, in una sessione di Claude Code
dentro `~/the-knowledge`:

> «smista l'inbox» — dopo aver spezzato il file esportato in `_inbox/`

C'è anche un `.json`, che esporta **tutto** l'archivio con i suoi campi: serve a
leggere le catture da codice, non a smistarle.

Il formato dei file è quello di [`METODO.md`](https://github.com/eneaqupovisione/the-knowledge)
§6, ed è il metodo a comandare: se i due divergono, si cambia il codice.

## Cosa c'è e cosa non c'è

✅ La cattura — la funzione 1 delle tre previste
✅ L'archivio, i progetti, il ponte verso `_inbox`
🔲 La vista trasversale delle scadenze — non esiste
🔲 Il ritorno sulle idee vecchie — non esiste
🔲 **La sincronizzazione col repo — non esiste**, e finché non c'è telefono e
computer restano due mucchi separati. Servono tre cose, e sono di Enea: il repo
pubblicato, un sito Netlify, un token GitHub nelle sue variabili d'ambiente

Le trappole note stanno in [`trappole.md`](trappole.md). Le prime due vale la
pena leggerle prima di fidarsi dell'app per qualcosa di importante.
