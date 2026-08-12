# La direzione visiva è il collage post-internet, e cade «scura di base»

data: 2026-08-12 · **stato: superata** — la 06 è stata rimossa il 2026-08-12,
→ `decisioni/2026-08-12-san-francisco-e-non-i-moodboard.md`.
Resta scritta perché il perché di una scelta scartata vale quanto quello di una tenuta.
**sostituisce** la regola «scura di base» scritta in testa a `stile.css`.

**Contesto.** L'aspetto era una scura calda con un accento oro, nata insieme
alla prima fetta e mai discussa: era il minimo per esistere, non una direzione.
Enea ha portato prima dei riferimenti di interfaccia (bento chiari, verde acido,
angoli larghi), poi due documenti di direzione da
`~/Desktop/moodboard vari/` — la **03, collage editoriale stratificato** e la
**06, collage post-internet** — chiudendo con *«questo ancora meglio»* sulla 06.

**Alternative considerate.**

- **Bento morbido con il verde acido come unico colore.** Scartata da lui
  esplicitamente: *«il verde acido non è l'unico colore»*. Era anche la lettura
  più povera dei riferimenti: prendeva la forma delle card e buttava via la
  palette.
- **03 — Collage editoriale stratificato** (crema, sabbia, teal, pomodoro,
  serif ad alto contrasto). Scartata, e non per gusto: **il documento stesso
  dice di non usarla qui.** «Non funziona per: prodotti tecnici, servizi che
  devono spiegare procedure» — e il suo rischio dichiarato è che «con immagini
  mediocri il sistema non ha nulla da stratificare e collassa su un fondale
  sfumato con dei pallini sopra». The Office non ha nessuna fotografia e non ne
  avrà: sarebbe collassata per costruzione.
- **06 — Collage post-internet** (acido, cielo, menta, allarme, il grigio
  dell'interfaccia, tipografia ordinaria). — **scelta.**

**Decisione.** Si adotta la 06 per intero: palette con i ruoli che il documento
assegna a ogni colore, tipografia ordinaria, e **tre dei sei dispositivi** —
il documento stesso dice di usarne tre o quattro, non tutti:

| Dispositivo | Dove vive qui |
|---|---|
| **La finestra lasciata a vista** | il contenitore ricorrente: la cattura, i pannelli. Barra grigia, tre pallini, ombra portata netta. La barra mostra il nome che il file avrà in `_inbox/` e se è già uscito di qui |
| **La griglia tecnica** | reticolo millimetrato sotto tutto, CSS puro |
| **La forma sciolta** | una sola, e porta un dato: il contatore. Menta a riposo, acido quando c'è roba non ancora uscita |

Fuori restano *parola ripetuta*, *cielo e cromo*, *angolo arricciato*: non
perché siano brutti, ma perché qui non avrebbero niente da affermare, e la
regola della direzione è che ogni elemento apparentemente decorativo sta facendo
un'affermazione.

**L'estensione: il foglietto, e il colore che è il tipo.** Chiesta subito dopo —
*«vorrei qualcosa di morbido, tipo post-it, e includere anche altri colori»*. Si
regge sulla stessa palette: acido, menta e cielo **sono già** i tre colori di un
blocchetto di foglietti adesivi. Si aggiungono panna, pesca, rosa e lilla, e ne
esce una regola che non è decorativa:

> **Aggiornato in giornata:** le sette tinte piatte sono diventate sette
> **gamme a tre valori** quando è entrata la 09 — il colore del foglietto è ora
> il valore *chiaro* della gamma del tipo, e i tre valori insieme fanno la trama
> del campione. L'elenco vero sta in `stile.css`, sui selettori `[data-tipo]`.
> → `decisioni/2026-08-12-la-materia-e-un-materiale-non-una-direzione.md`

**Il colore di un foglietto è il suo tipo, e niente altro nell'app usa quei
colori per dire altro.** La mappa si impara in cattura — la casella porta la sua
banda di colore, e il pulsante Salva prende il colore del foglietto che stai per
fare — e nell'archivio è già saputa: si scorre senza rileggere. Una cattura
senza tipo resta bianca, ed è giusto che si veda: è quella ancora da smistare.

La morbidezza sta **solo sui foglietti**, e per contrasto: raggio piccolo, ombra
di carta invece dell'ombra netta del software, una rotazione minima di mezzo
grado. La finestra resta dura, perché è software e deve sembrarlo. È la stessa
tensione della direzione — il cielo dipinto accanto al tubo di metallo.

**Perché regge su questo progetto.** Il documento elenca fra i casi buoni gli
**archivi** e i progetti «con un'idea forte da difendere», ed è l'unica delle
dodici famiglie nata sul web: *«parla di interfacce usando le interfacce»*. E la
tesi qui c'è davvero, non è un vestito: `_inbox/` **è** un'anticamera di file di
lavoro non finiti, e la finestra con la barra grigia lo dichiara invece di
nasconderlo dietro una scheda pulita. Il rischio scritto nel moodboard — «è la
più facile da svuotare» — si presenta il giorno in cui la finestra diventasse
una cornice attorno a qualcosa che non è un file. Quel giorno il dispositivo va
tolto, non decorato.

**Conseguenze.**

- **Cade «scura di base».** La 06 è un sistema su carta: l'acido, il cielo, la
  menta e soprattutto il grigio `--interfaccia` sono calibrati lì. La notte
  esiste, è curata e si sceglie in Impostazioni, ma non è più il valore di
  partenza. La ragione vecchia (il lampo arriva più spesso di sera) non è
  sbagliata: chi la sente ancora mette «Notte» o «Sistema», ed è un tocco.
- **Nessun webfont, e non è un compromesso.** I quattro caratteri del documento
  vengono da Google Fonts: caricarli sarebbe una dipendenza di rete e
  `index.html` smetterebbe di funzionare aperto come file. Ma la 06 chiede
  «caratteri di sistema, serif accademici, grottesche neutre — quelli che
  troveresti in un documento qualsiasi»: **Times più la grottesca di sistema più
  il mono di sistema è più dentro la dottrina di un webfont scaricato.** Se un
  giorno si vuole Instrument Serif vero, si mette nel repo — mai da un CDN.
- **Il disagio non entra nel percorso del salvataggio.** La direzione vuole
  un'immagine che «non si lascia consumare in fretta»; il progetto esiste per i
  cinque secondi. Vale la regola che il documento si dà da solo: *«la
  navigazione deve restare impeccabile mentre tutto il resto sembra
  provvisorio»*. Il collage sta nei materiali, mai nei gesti.
- **Il contrasto è una regola, non un gusto.** Nero su acido funziona; su cielo
  e menta è al limite, quindi lì vanno **solo etichette brevi** — i paragrafi
  tornano sempre su carta. Vale anche per chi aggiungerà schermate dopo.
