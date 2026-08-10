# CLAUDE.md — planimetria di The Office

> Se una cosa qui contraddice il codice, **vince il codice**: aggiorna questo file.

> Questo file dice *dove sono le cose*. *Perché sono così* sta in [`decisioni/`](decisioni/).

> Il **perché esiste** sta nel nodo: `~/the-knowledge/prodotti/the-office/README.md`.
> **Leggilo prima di proporre scelte di impostazione.** Contiene le tre cose che
> l'app deve fare, le tre che **non** deve fare, e un elenco di decisioni già
> prese che sembrano domande aperte e non lo sono.

## Cos'è

La porta di [The Knowledge](https://github.com/eneaqupovisione/the-knowledge):
cattura senza attrito, da telefono e da computer. Pagina web installabile,
**nessuna dipendenza, nessun passo di costruzione, nessuna rete**: si apre
`index.html` e funziona.

**Cosa non è, oggi.** Delle tre funzioni previste dal nodo, è costruita solo la
**prima**. La vista trasversale delle scadenze e il ritorno sulle idee vecchie
non esistono — non sono a metà: non ci sono.

**Cosa non deve diventare mai.** Un posto dove si scrive, si ragiona o si
ristruttura. Su quel terreno Claude Code è più forte di qualunque interfaccia, e
il nodo lo dichiara come limite del progetto, non come stato attuale.

## La planimetria

| File | Ruolo | Note operative |
|---|---|---|
| `index.html` | la schermata unica | non ce ne sono altre, ed è una scelta |
| `app.js` | tutta la logica | 7 tipi, salvataggio, contatore, esportazione. Nessuna chiamata di rete |
| `stile.css` | l'aspetto | scura di base, progettata a 375px, tutto ciò che si tocca sta in basso |
| `sw.js` | il guscio offline | cache-first. Alzare `VERSIONE` a ogni cambio di file, o l'app non si aggiorna |
| `manifest.webmanifest` · `icona.svg` | installabilità | |
| `decisioni/` | perché è così | una decisione per file |
| `trappole.md` | ciò che sembra vero e non lo è | |

## Il flusso dei dati

```
lampo → textarea → localStorage['the-office.catture']   (immediato, sincrono)
                        ↓
                   «esporta» → un file .md con dentro tutti i blocchi
                        ↓
                   smistamento → ~/the-knowledge/_inbox/*.md
```

**Non c'è nessun server, nessun database, nessun account.** I dati vivono nel
browser del dispositivo finché non vengono esportati.

## Dove NON mettere le mani

1. **Non aggiungere campi obbligatori alla cattura.** Il testo è l'unica cosa
   necessaria; tipo e appartenenza sono facoltativi e restano facoltativi. È il
   primo principio del metodo, non una preferenza di interfaccia.
2. **Non introdurre una chiamata di rete nel percorso del salvataggio.** Local-first
   è una decisione scritta: se la scrittura aspetta la rete, i cinque secondi sono
   già persi. La sincronizzazione, quando arriverà, sta *dopo* il salvataggio locale.
3. **Nessun segreto in questo repo.** Il token GitHub vivrà in una funzione lato
   server, mai nel dispositivo e mai nel bundle. Una chiave finita qui è pubblica
   per sempre, anche dopo il commit che la toglie.
4. **Non aggiungere una lista sfogliabile delle catture.** «Un canale di cattura
   scrive solo»: dal telefono non si naviga, non si legge, non si modifica. È ciò
   che tiene il problema piccolo. L'unica cosa che si vede è il **contatore**.
5. **Il contatore è sacro** e sta sempre in vista. Senza, la fiducia crolla in due
   settimane.

## Se il lavoro riguarda…

- **il metodo, dove va una cosa, una decisione** → `~/the-knowledge/METODO.md`
- **l'ordine del repo** → skill `repo-in-ordine`
- **il formato dei file dell'inbox** → `~/the-knowledge/METODO.md` §6, ed è la
  sorgente di verità: se l'esportazione e il metodo divergono, **vince il metodo**
