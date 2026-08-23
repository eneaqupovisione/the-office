# Trappole

> Le cose che **sembrano vere e non lo sono**. Si scrivono prima di risolverle,
> perché spesso non si risolvono — e allora almeno resta l'avviso.

La più recente in alto.

---

**Il numero che cambia a ogni apertura non busta la pagina che lo contiene.**
`ufficio.html` chiama i suoi `.js` con un `?v=` ricalcolato a ogni caricamento,
e sembra la fine del problema. Non lo è: quel numero sta **dentro** la pagina, e
la pagina non la busta nessuno. `python3 -m http.server` non manda nessun
`Cache-Control`, quindi il browser decide da solo per quanto tenersela — e la
regola che usa guarda quanto è vecchio il file, quindi più il file è stabile
più a lungo se lo tiene.

Il giorno in cui all'elenco degli script si è aggiunto `domande.js`, il browser
ha continuato a servire l'elenco vecchio: i quattro file di prima, caricati con
i numeri nuovi. `Domande` non esisteva, `bacheca()` moriva alla prima riga, e da
fuori si vedeva solo che **cambiare sezione non faceva niente** — nessun
messaggio, nessun indizio, e la console è l'ultimo posto in cui guardi quando
l'app «sembra solo lenta».

Due rimedi, e servono tutti e due:

- `servi.py` al posto di `http.server` (è quello che lancia `.claude/launch.json`):
  manda `no-store` e non manda `Last-Modified`, così non c'è più niente su cui
  fare l'euristica.
- In `ufficio.js`, `mancano()` guarda che `Passi`, `Radice` e `Domande` ci siano
  davvero, e se no scrive **«Manca un pezzo»** con un bottone che ricarica
  saltando la cache. Un'app che si rompe deve dirlo.

Attenzione a una cosa: `servi.py` cura le pagine **da qui in avanti**. Una copia
già in cache resta lì finché non la si sfratta, e un normale ricarica non basta
— ci vuole ⌘⇧R, o il bottone. *(2026-08-23)*

**«Porta diversa» non basta a scappare dal guscio.** L'ufficio nuovo gira su
`localhost:8010` proprio per non ereditare il service worker registrato su
`:8000`. Ma su 8010 il server serve la cartella intera, e `/` senza nome di
file dà `index.html` — cioè **la vecchia app**, che a quel punto registra il suo
guscio anche lì. Da quel momento `:8010/` serve `index.html` dalla cache
`the-office-v12` per sempre, e ci si ritrova a guardare la vecchia app credendo
di guardare la nuova: le sezioni ci sono tutte e sono tutte vuote, che è
esattamente l'aspetto di un'app rotta.

Peggio: il reindirizzamento messo dentro `index.html` per rimediare **non parte
neanche**, perché arriva dalla cache anche lui. Un rimedio che vive dentro il
file che il guscio ha congelato non è un rimedio.

Oggi quello script, oltre a reindirizzare, **smonta il guscio e svuota le
cache** — così una registrazione vecchia si cura da sola al primo caricamento
che riesce a passare. Ma se «non si aggiorna» resta il primo sospetto:

```js
navigator.serviceWorker.getRegistrations().then(r => r.forEach(x => x.unregister()))
caches.keys().then(k => k.forEach(x => caches.delete(x)))
```

La regola vera non è «cambia porta»: è **non lasciare due app raggiungibili
dalla stessa origine** — e il 2026-08-23 la seconda è stata cancellata, quindi
la trappola è chiusa. Resta scritta perché la regola vale ancora, e perché un
service worker registrato allora può essere ancora lì: se l'app «non si
aggiorna», quelle due righe sopra sono il primo sospetto. *(2026-08-21, chiusa il 2026-08-23)*

**Il colore dice l'appartenenza, e solo quella.** La tinta di una riga dice di
che cartella è. Se diventasse anche il modo di dire «urgente» o «bello», la
mappa si romperebbe in silenzio: da quel momento il colore non è più leggibile
a colpo d'occhio. Per la pressione c'è la scadenza, per ciò che si tocca c'è
l'acido — che infatti **non è in gamma** fra le tinte dei progetti.
*(2026-08-12, riscritta il 2026-08-23)*
