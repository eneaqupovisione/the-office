# Note di sincronizzazione

Progetto: **The Office** su claude.ai/design
`b138df05-a374-4a82-a50b-7ed6f41f5f1e`

## Perche' `shape: token-only`

The Office non e' una libreria di componenti: niente `package.json`, niente
`dist/`, e i nove `.js` scrivono nel DOM invece di esportare componenti React.
Il convertitore di `/design-sync` non ha niente da impacchettare.

Quello che si sincronizza e' l'unica cosa che The Office ha davvero da dare a
un agente che disegna: **i token, i caratteri e le regole**. Il pacchetto e'
`styles.css` + `tokens/tokens.css` + `fonts/` + `README.md`, senza
`_ds_bundle.js` e senza `components/`. Il selettore dei componenti resta
vuoto, ed e' corretto che lo sia.

## Qual e' la fonte, e non e' una sola

Deciso il **2026-08-26**: la fonte piu' fondata dell'aspetto e'
`design/mockup-bacheca.html`. Ma i token con i nomi buoni stanno in
`index.html`. Quindi il pacchetto li prende da tutti e due, cosi':

| Cosa | Da dove | Come |
|---|---|---|
| I 42 token | `index.html`, il `:root` | calco verbatim in `tokens/tokens.css` |
| I due caratteri | il mockup | scaricati e ospitati in `fonts/` |
| La scala tipografica | il mockup | tabella nel `README.md` |
| Le regole | il mockup | lette dalle sue regole CSS |

**`tokens/tokens.css` e' un calco, non una copia.** Si rigenera con
`sed -n '/^:root{/,/^}$/p' index.html` piu' il blocco `@media`, e non si
modifica mai a mano: se i due divergono vince `index.html`, che e' l'unico
posto dove `studio-web` sa leggere e riscrivere i token.

La correzione dei caratteri sta in `styles.css`, **dopo** l'`@import` del
calco, e non dentro il calco: `--font` in `index.html` e' ancora lo stack di
sistema perche' l'app non ha ancora adottato Instrument Sans, ma per un
disegno nuovo la versione fondata e' quella del mockup.

## Una regola che avevo sbagliato

Alla prima stesura avevo scritto `:focus-visible{ outline:2px solid
var(--acc-forte) }`. **Sbagliato**: il mockup usa `outline:2px solid
var(--inch)` in tutte e sette le occorrenze, e ha ragione — il giallo e' gia'
il colore del passaggio del mouse, e usarlo anche per il fuoco cancella la
differenza fra mouse e tastiera. Corretto.

## Niente `_ds_sync.json`

L'ancora di sincronizzazione vuole impronte prodotte dagli script del
convertitore, che qui non gira. Ometterla e' la scelta onesta: la prossima
sincronizzazione ricarica tutto invece di fidarsi di un'ancora inventata.

## Token dichiarati e non ancora usati da `ufficio.css` (2026-08-26)

Non e' un problema del pacchetto — per un agente che disegna cose nuove sono
token validi a tutti gli effetti — ma vale la pena saperlo:

- tutti gli otto `--gradino-*` e tutti e cinque i `--tono-*` (zero `oklch` in `ufficio.css`)
- `--vetro`, `--vetro-su`, `--velo`
- `--tenue-2`, `--acc-orlo`, `--acc-orlo-forte`
- `--ok`, `--ombra-2`
