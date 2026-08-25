# CLAUDE.md — planimetria di The Office

> Se una cosa qui contraddice il codice, **vince il codice**: aggiorna questo file.

## Cos'è

**L'organizzazione dei progetti.** Serve a tre cose precise: non perdere un
progetto sotto gli altri, avere una ragione per riprenderlo, e ritrovare le
belle idee che ci si era dimenticati di aver avuto.

Nessuna dipendenza, nessun passo di costruzione: si serve la cartella e si apre.

```bash
cd ~/Lavori/the-office && python3 servi.py 8010
```

## La planimetria

| File | Ruolo | Note operative |
|---|---|---|
| `index.html` | il documento | si apre dal computer e basta |
| `servi.py` | **il server delle prove** | non è `http.server`: manda `no-store` e non manda `Last-Modified`. Senza, il browser si tiene `index.html` per ore decidendolo da solo, la pagina vecchia carica i file nuovi, e l'app muore senza dire niente. È quello che lancia `.claude/launch.json` |
| `seed.js` | **il disco finto di `?prova`** | un campionario dei casi, in `localStorage`. Si prova tutto senza toccare un file vero — e **anche su Safari**, dove `showDirectoryPicker` non esiste. Si cancella con la sua riga in `index.html` quando non serve più |
| `radice.js` | `~/Lavori` collegata, e lo scandaglio | **calcola** il silenzio di ogni progetto dalla data di modifica dei file. Salta `node_modules` e compagnia — senza, `cantera` da sola sono 27.000 file — e si ferma a 400 file per progetto: il limite può far sembrare un progetto **più** silenzioso, mai più vivo. `attacca()` esiste solo per le prove |
| `passi.js` | il formato di `prossimi-passi.md` | perché · belle idee · da fare · fatte. Spuntare fa **scendere** la riga sotto `## Fatte` con la data, non la cancella. Ogni operazione dichiara che testo si aspetta di trovare e non fa niente se non combacia. **Non tocca il DOM: si prova da solo** |
| `domande.js` | le domande della Bacheca | «cosa sto dimenticando?» e le altre. Restituiscono due o tre proposte da una lista di progetti. **Non toccano il DOM e non scrivono niente: si provano da sole** |
| `ufficio.js` | le quattro sezioni e la scheda | ogni gesto rilegge il file, scrive, rilegge |
| `ufficio.css` | l'aspetto | impaginazione San Francisco, palette 06. L'acido è l'unico accento, ed è il colore di ciò che si tocca |
| `prova-passi.js` · `prova-radice.js` · `prova-domande.js` | le prove | `node prova-passi.js` e via. Niente dipendenze, niente `npm test` |

## Le quattro sezioni, e sono quattro domande

| | risponde a | contiene |
|---|---|---|
| **Bacheca** | *cosa faccio adesso* | **una mossa per progetto**, e solo dei progetti toccati negli ultimi 14 giorni. Si spuntano lì: spuntata una, arriva la successiva dello stesso progetto. In fondo, **le domande** |
| **Scrivania** | *cosa ho in mano* | **tutti** i progetti, per scadenza (due mucchi: qualcuno aspetta / nessuno aspetta) o per appartenenza (dentro la loro cartella) |
| **Rubrica** | *per chi lavoro* | i progetti raggruppati per `per:`, più le cose tue divise per tipo. È qui che nasce «un'idea per qualcuno» |
| **Caccia** | *chi non è ancora mio* | i nomi che non sono ancora progetti (`_caccia.md`), le cacce aperte (i progetti `sperimentale`), e le prese |

**La bacheca non è un censimento.** Mostra le mosse, non i progetti — e il
verso conta: quello che leggi per primo è la cosa da fare, il nome del lavoro
sta sotto e piccolo. Al contrario torna a essere un elenco di progetti, che è
esattamente quello che non deve essere.

Una riga dice: **la mossa** · il progetto · la scadenza · **«1 di 5»** · `i` ·
`»` · `›`. Il silenzio non c'è, e non è una dimenticanza: in Bacheca ci sono per
costruzione solo progetti toccati negli ultimi quattordici giorni, quindi quel
numero variava poco e non cambiava niente di quello che fai oggi. È tornato
dov'è utile — nella Scrivania, e sotto la `i`.

**Spunta solo la casella, e il segno si vede prima della scrittura.** Il clic
sulla riga apre la scheda e non tocca niente; la casella sta dentro
un'etichetta che le fa da bersaglio, così ci prendi senza mirare. Al clic la
riga si barra e sbiadisce per mezzo secondo (`RESPIRO`), **poi** si scrive il
file e arriva la mossa dopo. Prima faceva il contrario — scriveva e rifaceva
subito lo scandaglio — e la spunta durava un fotogramma: un gesto che non
lascia traccia non sembra riuscito, sembra un clic andato a vuoto.

**La `i` apre un'anteprima sotto la riga**, non un'altra schermata: il perché
del progetto, per chi, entro quando, da quanto tace, i conti e le belle idee.
Non è una scorciatoia per aprire il progetto — per quello c'è la freccia, ed è
un clic — serve a **decidere se aprirlo**, che è una domanda diversa e molto
più frequente. Una mossa scritta stringata tre settimane fa spesso non si
capisce da sola, e il perché la rimette in piedi senza farti perdere il posto.

`sol-y-mar` ha ventiquattro caselle aperte, e ventiquattro cose davanti non
sono uno stimolo: sono il motivo per cui richiudi. Una sì.

**Che i sepolti non compaiano in Bacheca è voluto** — deve restare corta o
smette di essere guardata. Ma allora devono stare *tutti* nella Scrivania,
compresi quelli fermi da mesi: se sparissero da tutte e due le sezioni,
l'app ricreerebbe il problema numero uno invece di risolverlo.

## Le domande, e perché l'app non riordina i passi

In fondo alla Bacheca ci sono tre parole. Non sono comandi: sono domande, e
premerne una apre sotto un cassetto con **due o tre cose**, non una lista.

| | mostra | perché esiste |
|---|---|---|
| **cosa sto dimenticando?** | mosse dei progetti che in Bacheca non ci sono, dal più silenzioso | è l'antidoto al problema numero uno. La Bacheca i sepolti li nasconde di proposito, e senza questa valvola non c'era **nessun** posto in cui tornassero a galla |
| **che idee avevo avuto?** | belle idee ferme, da qualsiasi progetto | è il problema numero tre. Un'idea si vedeva solo aprendo la scheda del progetto che non stai aprendo |
| **chi sta aspettando?** | i progetti con un `per:`, dalla data più vicina | la pressione guardata tutta insieme invece che una riga per volta |

C'era un'altra idea, ed è stata scartata il **2026-08-23**: che fosse **l'app a
ordinare i passi** dentro un progetto. Va contro la regola di questo repo — *si
calcola il passato, si dichiara il futuro* — perché quale mossa sia la prossima
è futuro puro: l'app non sa quale è pronta, quale aspetta una risposta, quale
costa dieci minuti. Ordinarli vorrebbe dire indovinare, cioè sbagliare in
silenzio. Ma *«questo non lo stai guardando»* è passato, e si calcola: le
domande sono la versione onesta di quella richiesta.

**Una domanda mostra ciò che non stai già vedendo — ma lo decide lei.** *Cosa
sto dimenticando* toglie quello che è in Bacheca (`nuoveSoltanto`), o
ripeterebbe il tabellone. *Chi sta aspettando* no: toglierli le faceva dire
«Nessuno» mentre un cliente era scaduto da nove giorni, che è una bugia.

**«per ora no» non è «no».** Su ogni riga — di Bacheca e di risposta — c'è un
bottone (`»`, con la frase intera nel `title`) che mette via quella cosa per **una settimana**, e poi la riporta.
Serve a sbloccare il tabellone: senza, una mossa che non fai ma non vuoi
nemmeno togliere tiene il suo progetto fermo in cima per tre settimane, e la
Bacheca diventa una cosa che smetti di guardare. Messa via una mossa, prende il
suo posto la successiva **dello stesso progetto**; messe via tutte, il progetto
esce dal tabellone finché non tornano.

Vive in `localStorage` e **non tocca il file**, ed è voluto: un `- [ ]` nel
`prossimi-passi.md` deve continuare a voler dire una cosa sola, o il file
smetterebbe di essere leggibile da Claude Code senza sapere le regole
dell'app. Il prezzo è che cambiando computer i rinvii riaffiorano — per una
settimana di rinvii è un prezzo giusto.

**Le belle idee stanno sotto le cose da fare, e piegate.** Non pesano allo
stesso modo: una cosa da fare è un impegno, un'idea è un cassetto da cui
attingi quando ti va. Aperte e per prime, la scheda apriva chiedendoti di
guardare cose che non devi fare. Piegate ma **sempre presenti**, anche a
cassetto vuoto, o il campo per scriverne una sarebbe irraggiungibile proprio
quando l'idea ti viene.

**Niente bottoni di servizio nella testata.** Lo scandaglio si rifà da solo
quando torni sulla finestra (mai mentre sei dentro una scheda: ti cancellerebbe
il campo da sotto le dita), e l'unico «aggiungi» dell'app sta nella Rubrica,
perché il posto dove nasce un'idea per qualcuno è l'elenco delle persone.

**In locale i `.js` si caricano con un numero che cambia a ogni apertura**
(`index.html`, in fondo). Senza, modifichi un file, ricarichi e non cambia
niente — lo stesso male del vecchio `?v=12` da tenere allineato a mano, ma qui
il numero se lo scrive la macchina e non si può sbagliare.

**Ma quel numero non busta la pagina che lo contiene**, ed è il buco in cui si
è caduti il 2026-08-23 aggiungendo `domande.js` all'elenco: pagina vecchia dalla
cache, file nuovi caricati, `Domande` inesistente, e da fuori si vedeva solo che
cambiare sezione non faceva niente. Per questo il server è `servi.py` e non
`http.server`, e per questo `ufficio.js` all'avvio **controlla che i pezzi ci
siano** (`mancano()`): se ne manca uno scrive «Manca un pezzo» con un bottone
che ricarica saltando la cache, invece di morire in silenzio. Una copia già in
cache però resta lì: la prima volta ci vuole ⌘⇧R, o quel bottone.

**Un progetto è una cartella che ha il suo `prossimi-passi.md`**, e non c'è
nessun altro modo di diventarlo: lo dichiari tu, e dichiararlo è crearlo. Può
stare al primo livello (`tablewise`) o al secondo (`cantera/sommelier-engine`);
se un lavoro non ha nessun progetto dichiarato dentro, nell'elenco compare lui.

C'era una regola che indovinava — «se dentro c'è un `.md` o un `.json` allora è
un progetto» — ed è caduta lo stesso giorno contro `~/Lavori` vera: faceva
passare per progetti `vittoria/foto` (400 jpg e un `indice.json`),
`vittoria/contenuti` (un `SEGNAPOSTO.md`) e `vittoria/marca`. Quaranta righe di
elenco di cui trenta sbagliate. **L'app non indovina: propone soltanto, e solo
dentro la scheda di un lavoro.**

Su `prossimi-passi.md` The Office comanda e può spostare righe. **Su ogni altro
`.md` spunta e basta**: `sol-y-mar/sito/consegna.md` ha le caselle numerate e
intrecciate alla prosa, e spostarle distruggerebbe il documento.

## La Caccia, e perché una preda non è un progetto

Le altre tre sezioni guardano quello che c'è. Questa guarda **quello che non
c'è ancora**: le persone a cui vorresti proporre qualcosa, e le cose che stai
facendo sperando che qualcuno le voglia.

Avevamo stabilito che un'idea per qualcuno **è già un progetto, gli manca solo
la cartella** — ed è vero *quando l'idea c'è*. Ma una preda spesso è solo un
nome e un aggancio: *«a quella pasticceria il menu lo stampano male»*. Farne
subito un progetto vorrebbe dire creare una cartella vuota che da quel momento
invecchia e ti accusa: l'app che si spara nei piedi.

Quindi la Caccia tiene i nomi **prima** che diventino progetti, e li promuove
quando l'idea arriva. *Fanne un progetto* apre il modulo già compilato — nome,
aggancio come perché, `tipo: sperimentale` — e la preda **scende fra le prese
con la data**: fra sei mesi vuoi sapere che quel nome l'avevi inseguito.

**`_caccia.md` è un `prossimi-passi.md`**, con le sezioni di sempre (`## Da
fare`, `## Fatte`): le sue caselle sono nomi invece che mosse. Un formato solo
— `Passi` lo sa già fare tutto e il file si corregge da Claude Code. Le parole
diverse stanno a schermo, dove servono: *sulla lista* non è «da fare», e
*presa* non è «fatta».

> Provato il contrario il 2026-08-23: chiamando le sezioni `## Prese` nel file,
> spuntare una preda ne creava una seconda in fondo, perché `Passi` cerca
> `## Fatte`. Il nome giusto per un file non è il nome giusto per una schermata.

## I modelli, e i passi grossi con le cose fini sotto

Un **modello** è un `prossimi-passi.md` già scritto bene, in `~/Lavori/_modelli/`.
Non ha un formato suo: **un modello è un progetto vuoto**, e per questo si
corregge da Claude Code come qualunque altro file. Creando un progetto lo
scegli da un menu; l'app gli cambia il titolo, ci mette il tuo perché al posto
di quello del modello, e i campi del front matter.

**Il legame finisce lì.** Il modello non resta agganciato: da quel momento
quei passi sono tuoi, li rinomini e li togli. Tenere il filo vorrebbe dire
un'app che chiede *«questo passo è cambiato nel modello, lo aggiorno?»*, ed è
un altro prodotto.

Le cartelle di primo livello che cominciano con `_` **non sono lavori**:
`_modelli` è un magazzino dell'app. Al secondo livello invece `_assets` e
`_trascrizioni` restano materiale del progetto, e lì si vogliono vedere.

### Un passo è finito quando qualcosa che prima non c'era adesso c'è

È la regola che ha buttato via due liste di passi prima di questa. «Capire a
cosa serve» e «decidere l'aria» non sono passi: sono stati mentali, e per
spuntarli devi giudicarti invece che guardare. Sono scesi dentro l'**indagine**,
che è un passo perché produce due cose — quello che hai trovato, e i dati finti
che diventeranno il contratto col back end.

`_modelli/sito.md` ha sei passi: *Indagine · Le pagine senza stile · La faccia ·
I comportamenti · La prova · La consegna*. Coprono dall'inizio alla **consegna
al back end**, che è dove finisce il lavoro di chi fa il front.

### Le cose fini stanno sotto, rientrate

```markdown
- [ ] Indagine
      - [ ] l'unica azione, in una frase
      - [ ] che dati girano, e in che forma
```

**In Bacheca va il passo grosso**, non la cosa fine: «Indagine», non «guardare
cosa c'è oggi». Ma la riga porta il conto dei suoi figli — **«2 di 5»** — e
quello si muove ogni giorno. Senza, un passo grosso resterebbe in cima due
settimane sembrando fermo, e la Bacheca smetterebbe di dare la soddisfazione
che la fa aprire.

**Una casella rientrata si spunta sul posto.** Scendere sotto `## Fatte`
lascerebbe orfano il passo che la conteneva e il conto non si potrebbe più
fare: qui la struttura vale più dell'uniformità. Scendono solo i passi di
primo livello, che sotto non hanno nessuno.

## I tre tipi di lavoro

```
commissione     qualcuno l'ha chiesto, e aspetta
personale       lo usi tu, e nessuno aspetterà mai
sperimentale    nessuno l'ha chiesto — ma se funziona ha un pubblico
```

**Ognuno chiede all'app una cosa diversa**, ed è l'unica prova che un campo si
merita di esistere: la commissione ha già la sua pressione e basta mostrarla;
il personale non deve accusarti **mai**; lo sperimentale è l'unico che va
**risvegliato** — nessuno lo aspetta, ma ci tieni, ed è esattamente il caso per
cui questa app è stata scritta.

Cosa cambia davvero:

| | |
|---|---|
| **il silenzio** | rosso solo dove significa qualcosa. Un `personale` fermo da 240 giorni resta grigio: tacere gli è permesso, e colorarlo sarebbe un rimprovero per una cosa che non è una colpa |
| **la Scrivania per scadenza** | tre mucchi invece di due — *qualcuno aspetta* · *nessuno aspetta ancora* · *nessuno aspetterà, e va bene* |
| **la Rubrica** | quello che non è per nessuno non è più un buco chiamato «senza destinatario»: sono *le cose che potresti vendere* e *le cose che usi tu*, più *non l'hai ancora detto* |
| **la domanda «per chi»** | cambia parole col tipo. A uno sperimentale diventa **«per chi lo faresti, se funzionasse»** — ed è quella la domanda che trasforma un desiderio in una cosa che pesa |

**Non si deduce dalla cartella.** Verrebbe comodo — un progetto dentro un
cliente è una commissione — ma il caso che rompe la regola è il più prezioso:
una dashboard nata per un ristorante che, se funziona, si vende ad altri
ristoranti *restando esattamente dov'è*. Quel passaggio nessuna cartella lo sa
dire. L'app lo **propone** alla creazione e tu lo cambi quando la realtà cambia.

**Assente vuol dire assente**: senza `tipo:` tutto si comporta come prima che
il campo esistesse. Un default che indovina è un default che sbaglia in
silenzio.

## Gli altri campi, e perché non ce n'è un quinto

In front matter, in cima al `prossimi-passi.md`:

```markdown
---
tipo: sperimentale       # commissione · personale · sperimentale
per: Hotel Riva          # chi aspetta — facoltativo
entro: 2026-09-05        # l'unica cosa che genera pressione
chiuso: 2026-08-21       # una data, non un sì/no: sai anche quando hai deciso
colore: blu              # facoltativo: se manca, si deduce dalla cartella
---
```

Lo stato si deduce: `entro` futuro → **in corsa**; `entro` passato →
**scaduta**; niente `entro` → **libero**; c'è `chiuso` → **fuori dall'elenco**.

E la regola che ne discende: **si calcola tutto ciò che riguarda il passato**
(da quanto tace, quanto hai fatto), **si dichiara solo ciò che riguarda il
futuro** (per chi, entro quando, e se è chiuso). Il passato lasciato a mano
sarebbe vecchio; il futuro sul disco non c'è.

Quando una data passa, l'app fa **una domanda**, non una multa — e «lascio
perdere la data» è una risposta legittima che costa un tocco. Un'app che ti
mette in mora è un'app che smetti di aprire, che è il modo in cui uno strumento
contro l'abbandono viene abbandonato.

## Toccare l'interfaccia invece di descriverla

La struttura sta in cima a `ufficio.js` come **dato**, non sparsa nelle
funzioni: `SEZIONI`, `SCHEDA`, `MOSSA`, `MOSSA_TESTO`, `RIGA`. Ogni nome è la
chiave di un registro — `PEZZI`, `PARTE_MOSSA`, `PARTE_RIGA` — e ogni pezzo è
una funzione che riceve il contesto e restituisce un nodo, o `null` se non ha
niente da dire. **Un nome che non esiste viene saltato**: si toglie un pezzo
commentandolo.

Spostare le idee sotto le cose da fare, invertire il verso di una riga della
Bacheca, togliere una sezione: è cambiare una riga lassù. Serve a Enea per
riorganizzare senza passare da me, e serve perché **nessun editor visuale può
salvare uno spostamento se la struttura vive dentro le funzioni** — non
esisterebbe un posto in cui scriverlo.

E l'aspetto si tocca con `~/Attrezzi/studio-web`:

```bash
node ~/Attrezzi/studio-web/studio.mjs "~/Lavori/the-office" index.html?prova
```

Il `?prova` non è un dettaglio: senza, dentro lo studio l'app chiederebbe una
cartella al browser invece di lasciarsi guardare. Da lì si toccano colori,
misure, caratteri e spaziature, e **salva** riscrive `index.html` lasciando
una copia datata.

Lo studio **non sposta e non riordina** — per quello ci sono le liste. E i
`.bak` che lascia stanno nel `.gitignore`.

## Il colore dice l'appartenenza

Una tinta per **cartella di lavoro**, e ogni progetto dentro una gradazione
della stessa. Serve a riconoscere di chi è una riga a colpo d'occhio — e serve
soprattutto in Bacheca, dove c'è una mossa scritta da sola che senza colore non
dice a quale lavoro appartiene.

**La tinta si deduce dal nome della cartella.** Dodici cartelle vestite senza
aver scritto niente, nessuna scelta da rifare quando ne nasce una, nessun file
di configurazione da tenere allineato. Se una tinta non va bene si scrive
`colore:` nel `prossimi-passi.md` — dodici nomi (`rosso`, `blu`, `ottanio`…)
oppure un numero di tinta — e quella vince. Sul progetto-radice di un lavoro
vale per tutto il lavoro, perché i figli ereditano.

**Il giallo acido non è in gamma, ed è voluto**: è il colore di ciò che si
tocca. Se diventasse anche il colore di un progetto smetterebbe di dire quello
— è la stessa regola di `stile.css`, ed è la trappola «il colore dice il tipo,
e solo quello» applicata qui.

Limite noto: la tinta di una cartella che **non è anche un progetto** (come
`cantera`, che ha solo sottocartelle) oggi si può solo dedurre, non scegliere.
Per sceglierla servirebbe un `prossimi-passi.md` alla sua radice, che la
farebbe comparire fra i progetti.

## Le impostazioni stanno dietro un bottone

`per`, `entro`, `colore` e `chiudi` non sono in cima alla scheda: sono dietro
**modifica**. Sono cose che si mettono una volta; lasciate aperte, la prima
cosa che vedi aprendo un progetto sarebbero tre campi da riempire invece del
perché per cui ti piaceva — che è la ragione per cui la scheda esiste.

## Un'idea per qualcuno che non è ancora un cliente

*«Mi è venuto in mente un problema, per una certa persona, e entro una certa
data potrei prepararle qualcosa.»* Se resta in testa muore; se viene scomposto
e scritto, forse no.

**Non c'è nessuna "watchlist" a parte**, con un suo formato e una sua
schermata — ed era la prima idea, scartata il 2026-08-21. Quel pensiero **è già
un progetto**: gli manca solo la cartella. Quindi il bottone `+ un'idea per
qualcuno` crea un progetto vuoto con `per`, `entro` e il problema come perché,
e da quel momento invecchia nella bacheca come tutti gli altri — che è
esattamente la pressione che a un'idea in testa manca.

Il modulo è lo stesso da tutte e due le porte — **Scrivania → + un progetto
nuovo** e **Rubrica → + un'idea per qualcuno** — e cambia solo il titolo e il
campo su cui si apre il cursore: dalla Rubrica parti da *per chi*, dalla
Scrivania dal nome. I campi sono **come si chiama · dentro quale cartella · per
chi · perché esiste · entro quando · colore**, e tutto tranne il nome è
facoltativo. Il nome della cartella si scrive da sé e resta correggibile. Le soluzioni **non** si chiedono lì: si aggiungono dopo,
nella scheda, come belle idee. Chiederle al momento della cattura vorrebbe dire
chiedere il lavoro prima dell'intenzione, e l'idea muore al secondo campo.

**I chiusi non contano come «qui dentro hai già dichiarato qualcosa».** Se
contassero, un lavoro il cui unico progetto è chiuso sparirebbe tutto intero,
portandosi via la roba viva che non hai ancora dichiarato. Trovato provando il
seed il 2026-08-21, con `tramonto` che si portava dietro `ricerca`.

### Le prove

```bash
node prova-passi.js     # 49 prove sul formato di prossimi-passi.md
node prova-radice.js    # lo scandaglio, contro la ~/Lavori vera
node prova-domande.js   # 33 prove su cosa ti viene messo davanti
```

Niente dipendenze e niente `npm test`: sono due file che si lanciano con
`node`. `prova-radice.js` monta una **maniglia finta** sul disco — parla come
una `FileSystemDirectoryHandle` ma sotto ha `fs` — e fa attraversare a
`radice.js` tutta `~/Lavori`, poi stampa l'elenco che vedresti. È l'unico modo
di provare lo scandaglio senza collegare una cartella a mano: senza, non lo
proverebbe mai nessuno.

Le due cose che tengono d'occhio, e che sono il motivo per cui il modello è
fatto così:

- **`urby` tace da 0 giorni, `food-cost-urby` da 150.** Un lavoro non deve mai
  poter mascherare un figlio sepolto: per questo la riga del lavoro misura solo
  i file della sua radice.
- **Se l'elenco dice «17 da fare», la scheda deve aprirne 17.** Un conteggio che
  non si può aprire promette una cosa che non c'è.
