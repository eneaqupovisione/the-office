# La via di mezzo: impaginazione San Francisco, palette 06

data: 2026-08-12 · stato: attiva
**affina** `2026-08-12-san-francisco-e-non-i-moodboard.md`, che resta valida in
tutto il resto.

**Contesto.** Tolte la 06 e la 09 e rifatto tutto in chiave San Francisco, il
giudizio è stato: *«sì ma che brutto, gli hai tolto lo stile della moodboard 6 —
riusciamo una via di mezzo?»*. È un'informazione precisa, ed è la prima volta
che i due giudizi messi insieme dicono qualcosa di utile: la 06 intera era
**troppo**, la San Francisco pura era **niente**. Il primo passaggio aveva
buttato via, insieme al tono da rapporto tecnico, anche l'unica cosa che dava
un'identità all'app — il colore.

**La diagnosi.** Le due direzioni non stavano rispondendo alla stessa domanda.
Da San Francisco viene **il mestiere**: gerarchia, spazio, misura dei tocchi,
carattere di sistema, ombre appena percettibili. Dalla 06 veniva **il
carattere**: la carta calda invece del grigio di sistema, il giallo acido invece
del blu-viola che hanno tutti, il grigio dell'interfaccia, i foglietti colorati.
Il mestiere senza carattere è anonimo; il carattere senza mestiere è un
esercizio di stile addosso a uno strumento che si usa venti volte al giorno.

**Decisione.** Si tiene l'impaginazione San Francisco e ci si rimette dentro la
materia della 06:

| Torna dalla 06 | Resta di San Francisco | Resta fuori |
|---|---|---|
| la carta calda come fondo | carattere di sistema, nessun webfont | la griglia a quadretti |
| l'acido come **unico** accento | scala tipografica e spaziatura | i campioni generati |
| il grigio dell'interfaccia | raggi morbidi, ombre leggere | le barre finestra coi pallini |
| i foglietti colorati per tipo | ordine e gerarchia delle schermate | il serif nei titoli |
| il mono per i dati | comportamento e accessibilità | il mono maiuscolo spaziato |

Tre precisazioni che tengono l'incrocio onesto:

- **Sull'acido si scrive in inchiostro, mai in bianco**, e l'acido non si usa
  mai come colore di un testo: per quello c'è `--acc-ink`, un oliva scuro. Vale
  anche per l'anello del fuoco, che in acido su carta chiara sparirebbe.
- **Il foglietto è colorato ma non è un post-it disegnato**: niente rotazione,
  niente ombra di carta finta. Stesso raggio e stessa ombra di ogni altra
  superficie — il colore basta a dire il tipo, il resto era costume.
- **Il mono solo dove c'è un dato** (il nome del file, i numeri). È la regola
  che tiene lontano il tono anni 70: appena il mono diventa la voce delle
  etichette, l'app torna a sembrare un rapporto tecnico.

**Perché è una decisione e non un compromesso.** Perché assegna a ciascuna delle
due direzioni il livello su cui è competente — struttura e comportamento alla
prima, materia e colore alla seconda — invece di mediare a metà strada su
entrambi. Il criterio per il futuro è quello: un moodboard può dare **materiali**
a questa app, non la sua **struttura**, perché nessuno dei documenti è scritto
per uno strumento che si apre venti volte al giorno.

**Conseguenze.**

- **`--acc` è l'acido ovunque**: pulsanti, voce attiva del menu, contatore
  pieno, campi a fuoco. Se un giorno qualcuno introduce un secondo accento, il
  sistema perde subito il suo unico segnale forte.
- **Sette coppie di colori** invece di sette tinte: `--f-*` è il fondo del
  foglietto, `--c-*` è il testo della sua etichetta. Sono due valori della
  stessa famiglia e vanno cambiati insieme.
- **La riga sotto il foglio è tornata a essere una fascia grigia** — è il solo
  residuo formale della «finestra» della 06, e resta perché porta un'
  informazione vera: dove sta andando quello che stai scrivendo.
