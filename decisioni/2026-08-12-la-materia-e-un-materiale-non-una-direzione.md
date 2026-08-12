# La 09 entra come materiale dentro la 06, non al posto suo

data: 2026-08-12 · **stato: superata** — i campioni sono stati rimossi il 2026-08-12,
→ `decisioni/2026-08-12-san-francisco-e-non-i-moodboard.md`.
Resta scritta perché il perché di una scelta scartata vale quanto quello di una tenuta.
**estende** `2026-08-12-la-direzione-visiva-e-il-collage-post-internet.md`
(e ne sostituisce le tinte piatte con le gamme a tre valori).

**Contesto.** Costruita la 06, il giudizio è stato *«ancora non mi fa impazzire
il design»*, con in mano la **09 — Astrazione generativa organica**. La domanda
sembrava «quale delle due», e non lo era.

**Quello che dice il documento della 09, e che decide da solo la questione.**

> «Non è una direzione grafica. **È una cava da cui estrarre materiale.**»
> «Questa famiglia **non produce composizioni**: non c'è impaginazione, non c'è
> tipografia, non c'è gerarchia. Produce superfici — deve essere accoppiata a un
> sistema tipografico che la contenga.»
> «Va accoppiata a: manifesto monocromo o collage editoriale.»
> «Non funziona per: progetti che devono comunicare un messaggio preciso e in
> fretta.»
> «Il suo rischio: restare un esercizio. Senza un progetto che la contenga,
> produce belle immagini che non fanno niente.»

Quindi la 09 **non può** sostituire la 06: le serve esattamente ciò che la 06 è.
E la sua controindicazione — comunicare in fretta — è la definizione del
progetto, il che stabilisce anche *dove* può stare: ovunque tranne sul percorso
dei cinque secondi.

**Alternative considerate.**

- **Sostituire la 06 con la 09.** Impossibile per costruzione, non per gusto: la
  09 non produce impaginazione né gerarchia. Sarebbe rimasto un fondale sotto
  un'app senza sistema.
- **Il campo intero come fondale** (la prima delle tre soluzioni di layout del
  documento). Scartata: la trama alterna chiaro e scuro e il testo «rischia di
  sparire a metà parola» — lo dice il documento, e qui il testo è tutto ciò che
  l'app contiene.
- **Oggetto isolato + campionario** (la seconda e la terza, che il documento
  chiama «la soluzione più solida» e «trasforma un materiale in un sistema di
  identità»). — **scelta.**

**Decisione.** Ogni cattura si porta dietro un **campione**: una superficie
generata — trama fittissima piegata da un campo di rumore — nella gamma del suo
tipo, affiancata al testo e mai sotto.

- **Il seme è l'id della cattura.** Lo stesso pensiero ha sempre la stessa
  faccia: è un'impronta, non un effetto. Se fosse casuale a ogni ridisegno
  sarebbe decorazione, e andrebbe tolto.
- **Una gamma per pezzo, tre valori** (chiaro, base, scuro): il chiaro è il
  colore del foglietto, tutti e tre insieme sono la trama. Le tinte piatte di
  ieri diventano il valore chiaro delle gamme, quindi il sistema è uno solo.
- **Sei campi di rumore fissi**, riusati: i filtri SVG costano in GPU e
  moltiplicarli non aggiunge niente che l'occhio veda.
- **I numeri della ricetta sono vincoli**: passo 9px in tre bande da 3px (sotto
  i 3px interferisce con la griglia dei pixel, sopra i 10px non è più materia);
  trama debordante del 30%, o la deformazione svuota i bordi; due luci separate
  sopra la trama, sorgente sola.
- **L'archivio diventa un campionario**, ed è il punto: la serie dice più del
  singolo pezzo.

**Perché non è ornamento.** Perché il campione porta due informazioni che
nell'app esistono davvero — *di che tipo è* (la gamma) e *quale oggetto è*
(la faccia, stabile) — e perché la sua assenza si nota: una cattura senza tipo
ha la gamma gesso, cioè materiale grezzo, e si vede a metri di distanza che è da
smistare.

**Conseguenze.**

- **Costo in GPU.** Il documento avverte: massimo tre o quattro superfici
  animate per pagina. Qui non sono animate — nessuna cambia dopo essere stata
  disegnata — ma un archivio molto lungo resta la prima cosa da misurare se
  l'app inizia a scattare. → `trappole.md`
- **Il seme dipende dall'id.** Se un travaso dei dati rigenerasse gli id, tutte
  le facce cambierebbero insieme e l'archivio non sarebbe più riconoscibile.
  Gli id non si toccano.
- **Il pulsante Salva resta acido**, non prende la gamma del tipo: nella 06
  l'acido è *ciò che si tocca*, e un pulsante che cambia colore perde il suo
  posto nella gerarchia. A dire che foglietto verrà fuori ci pensa il campione
  che gli sta accanto.
- **Il giorno in cui i campioni si somigliassero tutti** — stessa faccia, stessa
  gamma, deformazione addolcita — il dispositivo è diventato un motivo
  decorativo e va tolto, non ritoccato. È l'esercizio contro cui il documento
  mette in guardia.
