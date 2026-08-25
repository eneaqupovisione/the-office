# The Office

**L'organizzazione dei progetti.** Serve a tre cose precise, e sono tre problemi
diversi:

- **inizio un progetto e viene sotterrato dagli altri** — quindi lo perdo;
- **non ho una ragione per riprenderlo** quando lo ritrovo;
- **le belle idee che avevo avuto me le sono dimenticate.**

Nessuna dipendenza, nessun passo di costruzione, nessun account.

```bash
cd ~/Lavori/the-office && python3 servi.py 8010
```

poi `http://localhost:8010`. Per provarla su un disco finto —
senza toccare nessun file vero, e da qualunque browser — basta aggiungere
`?prova`.

## Le quattro sezioni, e sono quattro domande

| | risponde a |
|---|---|
| **Bacheca** | *cosa faccio adesso* — una mossa per progetto, dei soli progetti vivi |
| **Scrivania** | *cosa ho in mano* — tutti, per scadenza o per cartella |
| **Rubrica** | *per chi lavoro* — raggruppati per destinatario |
| **Caccia** | *chi non è ancora mio* — i nomi prima che diventino progetti |

## Come funziona

**L'app non ha dati suoi.** Legge le cartelle che hai già in `~/Lavori`, e ogni
progetto è una cartella con dentro il suo `prossimi-passi.md`:

```markdown
---
tipo: commissione        # commissione · personale · sperimentale
per: Bottega Marconi     # chi aspetta
entro: 2026-09-05        # l'unica cosa che genera pressione
---

# sito

> far vedere il pane prima del prezzo

## Belle idee
- le ore di sfornata in cima alla pagina

## Da fare
- [ ] costruire il sito

## Fatte
- [x] 2026-08-18 · brief con la proprietaria
```

Lo stesso file si legge e si scrive **da Claude Code come dall'app**, ed è il
punto: quando le due cose divergono, vince il file.

**Da quanto un progetto tace lo calcola l'app**, dalla data dei suoi file — non
si dichiara, quindi non si può dimenticare di aggiornarlo. È l'unico modo di
avere un dato giusto proprio per i progetti che hai abbandonato.

## Le prove

```bash
node prova-passi.js      # il formato di prossimi-passi.md
node prova-radice.js     # lo scandaglio, contro la ~/Lavori vera
node prova-domande.js    # le domande della Bacheca
```

Tre file che si lanciano con `node`. Niente dipendenze, niente `npm test`.

## Dove sta il resto

La planimetria completa — cosa fa ogni file, le decisioni prese e quelle
scartate — sta in [`CLAUDE.md`](CLAUDE.md). Le cose che sembrano vere e non lo
sono, in [`trappole.md`](trappole.md).
