# The Office

> **Sta cambiando mestiere.** Dal 2026-08-21 The Office non è più «cattura
> testo in fretta»: è **l'organizzazione dei progetti**, e vive in
> `ufficio.html`. Serve a tre cose precise — non perdere un progetto sotto gli
> altri, avere una ragione per riprenderlo, e ritrovare le belle idee che ci
> si era dimenticati di aver avuto.
>
> ```bash
> cd ~/Lavori/the-office && python3 -m http.server 8010
> ```
>
> poi `http://localhost:8010/` — che porta all'ufficio nuovo. Per provarlo su
> un disco finto, senza toccare nessun file vero e da qualunque browser
> (Safari compreso): `http://localhost:8010/ufficio.html?prova`.
>
> La planimetria sta in [`CLAUDE.md`](CLAUDE.md). **Quello che segue descrive
> l'app vecchia**, che è ancora intera e ancora in linea, e si spegne quando le
> catture rimaste sul telefono saranno state esportate.

---

Cattura testo in fretta, da telefono e da computer, e lo fa uscire come file
`.md` veri in `~/the-knowledge/_inbox/` — un albero che **dal 2026-08-21 non
esiste più** sul disco: resta solo il repo privato omonimo su GitHub.

## Provarla, adesso

```bash
open ~/Lavori/the-office/index.html
```

Non serve nient'altro: nessun `npm`, nessuna costruzione, nessun account. Si apre
il file e funziona.

Il percorso completo è: **apri → scrivi → ⌘+invio.** Il campo del testo ha il
fuoco all'apertura, e nessun altro campo è obbligatorio.

Per la **cartella collegata** (sotto) serve `localhost` invece del file:

```bash
cd ~/Lavori/the-office && python3 -m http.server 8000
```

poi `http://localhost:8000`.

## Le sei schermate

Il menu sta a sinistra: fisso da 900px in su, a scomparsa sotto — si apre dal
bottone in alto e si chiude anche trascinandolo via col dito.

| | |
|---|---|
| **Cattura** | è la schermata che si apre, sempre. Scrivi, e basta |
| **Archivio** | le catture raggruppate per progetto. Si legge, si cerca, si corregge l'etichetta. **Il testo non si modifica** |
| **Commissioni** | i lavori per conto terzi: una scheda per cartella dentro `clienti/`, con le cose da fare, quelle fatte e il campo per appenderne di nuove |
| **Acquisti** | tre liste — da comprare, in corso, presi — dentro `personale/acquisti.md` |
| **Progetti** | i nomi già usati, più quelli che vuoi aggiungere o leggere dai repo pubblici di GitHub |
| **Impostazioni** | sincronizzazione, ponte verso `_inbox`, tema, e il pannello che calcola dove finiscono davvero le catture |

### Catturare

| | |
|---|---|
| **Scrivi** | il campo è già pronto. Il testo è l'unica cosa necessaria |
| **Di che progetto è** | facoltativo, ed è l'unico altro campo. Gli ultimi cinque progetti usati sono un tocco solo |
| **Salva** | il pulsante, oppure ⌘/Ctrl + invio |
| **Il contatore** | sempre in vista. Dice quante catture **non sono ancora uscite** |

Il progetto **resta** dopo il salvataggio: capita spesso di catturare due cose
di fila sullo stesso.

Che genere di cosa sia una cattura non lo chiede più: al momento del lampo
l'unica cosa che sai e che un agente non può dedurre è di quale progetto si
tratta. L'etichetta la mette lo smistamento.

Se la prima riga è corta e comincia col nome di un progetto («cantera, il menu
che cambia»), l'app lo riconosce e lo propone — confrontando parole, senza
indovinare. Confermi con un tocco.

## Commissioni e acquisti

Sono le due sezioni che **non catturano**: leggono file che esistono già
nell'albero e li riscrivono sul posto. Vogliono la cartella collegata.

Una commissione è una cartella dentro `clienti/`, e le sue cose da fare sono le
caselle `- [ ]` del suo `prossimi-passi.md`. L'app le spunta, le rinomina (basta
scriverci dentro), le toglie e ne aggiunge — e **non tocca nient'altro del
file**: titoli, prosa e tabelle restano dov'erano. Lo stesso file si continua a
leggere e scrivere da Claude Code, ed è il punto.

## Portare le catture nell'inbox

Tre strade.

**La sincronizzazione** — ovunque, telefono compreso, da sola. L'app manda la
cattura al portiere (`netlify/functions/cattura.js`), che ha il token GitHub e
scrive nel repo. Parte **dopo** il salvataggio locale: se la rete non c'è, la
cattura resta «in attesa» e riparte al giro dopo. Vuole la chiave d'app, che si
scrive una volta in *Impostazioni*.

**La cartella collegata** — computer, Chrome o Edge, da `https` o `localhost`.
In *Impostazioni → Collega la cartella* scegli `~/the-knowledge` (la **radice**,
non `_inbox`: da `_inbox` non si vedono i progetti). Da lì in poi ogni cattura
finisce in `_inbox/` come file `.md`, da sola. Il permesso si dà una volta; se il
browser lo lascia scadere, il pannello lo dice e un tocco lo rinnova.

**L'esportazione** — ovunque, a mano, e funziona anche senza niente configurato.
*Impostazioni → Esporta per l'inbox* scarica un `.md` con dentro tutte le catture
in attesa, ognuna già con la sua intestazione e separata dalle altre.

C'è anche un `.json`, che esporta **tutto** l'archivio con i suoi campi: serve a
leggere le catture da codice, non a smistarle.

## Cosa c'è e cosa non c'è

✅ Le idee, l'archivio, i progetti
✅ Le tre strade verso `_inbox`, sincronizzazione compresa
✅ Commissioni e acquisti — richiedono la cartella collegata (Chrome o Edge sul computer)
🔲 Commissioni e acquisti dal telefono — servirebbe che il portiere sappia
   leggere e riscrivere file fuori da `_inbox/`, e oggi non lo sa
🔲 Il ritorno sulle idee vecchie — non esiste

Lo stato reale della sincronizzazione (chiave presente, portiere raggiungibile,
dove finiscono davvero le catture) lo **calcola** il pannello in *Impostazioni*:
non è scritto a mano da nessuna parte, quindi non può mentire.

Le trappole note stanno in [`trappole.md`](trappole.md). Le prime due vale la
pena leggerle prima di fidarsi dell'app per qualcosa di importante.
