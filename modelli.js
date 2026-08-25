/* ═══════════════════════════════════════════════════════════════════════════
   I MODELLI — quello che un progetto sa già di sé prima di cominciare.

   Un modello è un `prossimi-passi.md` scritto bene. Stanno **qui dentro**, nel
   codice, e non in una cartella sul disco: così l'app non dipende da niente,
   viaggiano col repo, e chi apre The Office su un altro computer se li trova.

   Se un giorno ne vuoi uno tuo, un `.md` in `~/Lavori/_modelli/` compare nel
   menu accanto a questi. Ma non serve perché l'app funzioni.

   ## Come è fatto un modello

   Le **fasi** sono le caselle di primo livello — quelle che finiscono in
   Bacheca. Sotto ognuna, rientrati:

       > la nota: perché quella fase esiste, in una frase o due
       - [ ] le cose fini che la chiudono

   La nota non è decorazione: è la differenza fra un elenco di comandi e un
   modo di lavorare. *«Il passaggio più sottovalutato: non stai consegnando
   file, stai consegnando un contratto»* è il genere di frase che, letta al
   momento giusto, ti fa fare la cosa nell'ordine giusto.

   I **marcatori** viaggiano nel testo della casella, e non hanno bisogno di
   nessun meccanismo:

       ⚑ critico   se lo salti, il problema torna dopo e costa dieci volte tanto
       ◆ nodo      punto di snodo fra fasi: decide il lavoro a valle

   ## Il legame finisce alla creazione

   Il modello non resta agganciato al progetto: da quel momento quei passi sono
   tuoi, li rinomini e li togli. Correggere un modello vale **dal prossimo
   progetto in poi** — tenere il filo vorrebbe dire un'app che chiede «questo
   passo è cambiato nel modello, lo aggiorno?», ed è un altro prodotto.
   ═══════════════════════════════════════════════════════════════════════ */

const Modelli = (() => {

  /* ── sito ───────────────────────────────────────────────────────────────
     Dodici fasi, dal brief all'online. **Non sono un muro**: contenuti e front
     end si sovrappongono quasi sempre, e la 02 va rivista ogni volta che la 06
     chiede qualcosa che il sistema non prevede. Le uniche due che conviene non
     anticipare mai sono la 01 prima della 00, e la 07 prima della 06
     approvata. */

  const SITO = `# sito

> a cosa serve questo sito, e qual è l'unica azione di chi arriva

## Belle idee

## Da fare

- [ ] 00 · Inquadramento
      > Prima di ricercare qualsiasi cosa: capire perché il sito esiste e chi decide. Saltare questa fase è la causa numero uno dei progetti che si allungano.
      - [ ] Scrivere l'obiettivo di business in una frase misurabile (non «avere presenza online»)
      - [ ] Definire l'azione principale che l'utente deve compiere sul sito
      - [ ] Individuare una sola persona che approva — ⚑ critico
      - [ ] Fissare budget, scadenza reale e chi mantiene il sito dopo la consegna
      - [ ] Scrivere il perimetro: cosa NON si fa in questa versione
      - [ ] Concordare quante revisioni sono incluse e cosa succede oltre
      - [ ] Definire cosa significa «finito» per questo progetto
- [ ] 01 · Ricerca
      > Raccogliere i vincoli reali: come parlano i clienti, cosa fanno i concorrenti, cosa dicono i dati esistenti. Si chiude con pochi insight, non con una cartella di screenshot.
      - [ ] Parlare con chi conosce i clienti davvero (staff di sala, venditori, assistenza)
      - [ ] Raccogliere le domande che i clienti fanno più spesso — diventano contenuti
      - [ ] Analisi competitor: posizionamento, promesse, prezzi, tono
      - [ ] Estrarre l'impronta visiva dei riferimenti (palette, tipografia, librerie usate)
      - [ ] Leggere l'analitica del sito attuale: pagine più viste, uscite, dispositivi, sorgenti
      - [ ] Ricerca parole chiave e intenti di ricerca
      - [ ] Inventario dei contenuti esistenti: cosa si salva, cosa si riscrive, cosa si butta
      - [ ] Sintesi finale: 3–5 insight che vincolano le scelte di design
- [ ] 02 · Strategia e architettura
      > Qui si decide la struttura, non l'aspetto. Il modello dei contenuti definito qui è quello che il back end dovrà implementare: sbagliarlo ora costa dieci volte tanto dopo.
      - [ ] Proposta di valore e messaggio principale in una frase
      - [ ] Mappa del sito: pagine, gerarchia, cosa sta nella navigazione
      - [ ] Percorsi utente: i 2–3 flussi che portano all'azione principale
      - [ ] Modello dei contenuti: tipi, campi, relazioni, obbligatorietà — ◆ nodo
      - [ ] Struttura degli URL e regole dei permalink
      - [ ] Decidere sito statico, CMS o headless — e perché
      - [ ] Requisiti tecnici: form, lingue, pagamenti, prenotazioni, integrazioni
      - [ ] Metriche di successo e come verranno misurate
- [ ] 03 · Direzione visiva e design system
      > Prima si sceglie una direzione, poi la si trasforma in un sistema. Un design system non è una libreria di componenti: è un insieme di decisioni già prese, così da non riaprirle a ogni schermata.
      - [ ] Proporre 2–3 territori visivi distinti, ciascuno motivato dalla ricerca
      - [ ] Far scegliere una sola direzione e chiudere le altre
      - [ ] Testare la direzione su una schermata reale prima di espanderla — ⚑ critico
      - [ ] Token di colore: scala grezza + assegnazione semantica (superficie, testo, bordo, azione, errore)
      - [ ] Scala tipografica: famiglie, pesi, dimensioni, interlinea, misura di riga
      - [ ] Scala di spaziatura, raggi, ombre, bordi
      - [ ] Griglia e breakpoint
      - [ ] Verifica contrasto dei token in ogni combinazione prevista
      - [ ] Componenti portanti: bottone, campo, select, card, navigazione, footer
      - [ ] Tutti gli stati di ogni componente: riposo, hover, focus, attivo, disabilitato, errore, caricamento, vuoto
      - [ ] Nomenclatura dei token e regole d'uso scritte
      - [ ] Definire cosa succede quando serve un componente non previsto
- [ ] 04 · Wireframe e prototipo
      > Validare struttura e priorità senza che il cliente si distragga sui colori. Serve contenuto vero: il lorem ipsum nasconde tutti i problemi che poi emergono in produzione.
      - [ ] Blocchi delle pagine chiave, senza colore e senza font definitivi
      - [ ] Usare contenuto reale o realistico, mai lorem ipsum — ⚑ critico
      - [ ] Partire dal mobile e poi risalire
      - [ ] Prototipo cliccabile dei flussi critici
      - [ ] Test rapido su 3–5 persone estranee al progetto
      - [ ] Revisione con il cliente inquadrata sulla struttura, non sull'estetica
      - [ ] Correzioni e approvazione della struttura prima di passare alla UI
- [ ] 05 · Contenuti
      > Nella maggior parte dei progetti i contenuti sono il vero collo di bottiglia. Vanno chiesti presto, con scadenze e formati precisi, altrimenti bloccano il lancio.
      - [ ] Copy delle pagine chiave: titoli, sottotitoli, corpo, chiamate all'azione
      - [ ] Microcopy: etichette, messaggi d'errore, stati vuoti, conferme
      - [ ] Richiesta formale al cliente con elenco, formati e scadenza — ⚑ collo di bottiglia
      - [ ] Foto e video: cosa esiste, cosa va prodotto, chi lo produce
      - [ ] Ottimizzazione asset: formati moderni, ritagli responsive, pesi
      - [ ] Testi SEO: title, meta description, alt delle immagini
      - [ ] Testi legali: privacy, cookie, termini, dati aziendali
      - [ ] Revisione ortografica e di coerenza terminologica
- [ ] 06 · UI ad alta fedeltà
      > Applicare il sistema al contenuto reale. Se ti servono decisioni nuove qui, il design system della fase 03 è incompleto: torna indietro e aggiornalo, non improvvisare sulla singola pagina.
      - [ ] Pagine chiave complete in versione desktop e mobile
      - [ ] Casi limite: titolo lunghissimo, lista vuota, immagine mancante, prezzo assente
      - [ ] Specifica di interazioni, transizioni e animazioni
      - [ ] Ogni scelta nuova rientra nel design system come token o componente
      - [ ] Presentazione e approvazione formale del cliente — ⚑ firma
      - [ ] Congelamento del design: definire come si gestiscono le modifiche successive
- [ ] 07 · Costruzione front end
      > Tradurre il sistema in codice, componente per componente. I token diventano custom properties: se il design system è fatto bene, questa fase è quasi meccanica.
      - [ ] Setup: repository, struttura cartelle, convenzioni di nomi, ambiente locale
      - [ ] Token tradotti in CSS custom properties, un unico file sorgente — ◆ nodo
      - [ ] Reset e stili di base: tipografia, colori, focus
      - [ ] Markup semantico: landmark, gerarchia dei titoli, liste, form
      - [ ] Componenti uno alla volta, con tutti gli stati previsti
      - [ ] Comportamenti: navigazione, form, filtri, modali, caroselli
      - [ ] Responsive verificato ai breakpoint reali, non solo nel simulatore
      - [ ] Accessibilità: navigazione da tastiera, focus visibile, ARIA solo dove serve
      - [ ] Progressive enhancement: cosa continua a funzionare senza JavaScript
      - [ ] Performance: peso pagina, caricamento font, immagini differite, script non bloccanti
      - [ ] Pulizia: codice morto rimosso, commenti dove serve capire il perché
- [ ] 08 · Consegna al back end
      > Il passaggio più sottovalutato. Non stai consegnando file: stai consegnando un contratto su quali dati arrivano, in che forma, e cosa deve succedere quando non arrivano.
      - [ ] Documento di handoff: struttura file, convenzioni, come si aggiunge una pagina
      - [ ] Contratto dati: per ogni blocco, quali campi, tipo, obbligatorietà, lunghezza massima — ⚑ critico
      - [ ] Marcare nel markup cosa è statico e cosa è dinamico
      - [ ] Consegnare gli stati che il back end deve poter produrre: vuoto, caricamento, errore, paginazione, nessun risultato
      - [ ] Concordare endpoint o schema CMS, con nomi definitivi dei campi
      - [ ] Fornire dati di esempio realistici, inclusi i casi limite
      - [ ] Regole di validazione dei form: lato client e lato server, con i messaggi esatti
      - [ ] Definire dove finiscono i dati dei form e chi riceve la notifica
      - [ ] Sessione di allineamento con chi implementa, non solo un file inviato
      - [ ] Rientro dopo l'integrazione: verificare che la UI non si sia rotta — ⚑ critico
- [ ] 09 · Verifiche pre-lancio
      > Passata sistematica su tutto, su staging, con dati veri. Si fa prima del lancio e non durante, perché in produzione ogni errore è pubblico.
      - [ ] Test su browser e dispositivi reali, inclusi Safari iOS e schermi piccoli
      - [ ] Ogni form testato fino alla destinazione finale (casella email compresa)
      - [ ] Link rotti, pagina 404 personalizzata, redirect dai vecchi indirizzi
      - [ ] SEO tecnico: sitemap, robots, canonical, dati strutturati
      - [ ] Anteprime social: Open Graph, immagine di condivisione, titolo
      - [ ] Core Web Vitals e punteggio Lighthouse su pagine reali
      - [ ] Passata di accessibilità solo da tastiera e con screen reader
      - [ ] Conformità privacy: banner cookie, analytics, base giuridica dei form
      - [ ] Backup del sito precedente e piano di rollback scritto
      - [ ] Revisione finale del cliente su staging, con lista di correzioni chiusa
- [ ] 10 · Messa online
      > Sequenza tecnica breve ma piena di trappole. Non lanciare di venerdì pomeriggio, e abbassa il TTL del DNS qualche giorno prima.
      - [ ] Abbassare il TTL del DNS con qualche giorno di anticipo
      - [ ] Dominio puntato, certificato HTTPS attivo
      - [ ] Redirect coerenti: http verso https, www verso non-www (o viceversa)
      - [ ] Deploy e verifica immediata delle pagine chiave in produzione
      - [ ] Rimuovere noindex e sbloccare robots.txt — ⚑ errore classico
      - [ ] Redirect 301 da tutti i vecchi URL indicizzati
      - [ ] Analytics e monitoraggio attivi e verificati con un evento reale
      - [ ] Email transazionali funzionanti, SPF e DKIM configurati
      - [ ] Sitemap inviata a Search Console
      - [ ] Comunicare al cliente che è online e cosa guardare
- [ ] 11 · Dopo il lancio
      > Il progetto non finisce con il deploy. Qui si chiude la consegna e si apre l'eventuale rapporto continuativo, che è dove sta il margine.
      - [ ] Monitoraggio delle prime 48 ore: errori, form, traffico, segnalazioni
      - [ ] Consegna accessi e credenziali in modo tracciato
      - [ ] Documentazione breve + video di 10 minuti su come si aggiorna il sito
      - [ ] Formazione del cliente sul CMS, con lui che clicca
      - [ ] Proposta di manutenzione: aggiornamenti, backup, sicurezza, piccole modifiche
      - [ ] Revisione a 30 giorni sui dati reali contro le metriche della fase 02
      - [ ] Backlog di ciò che era stato escluso dal perimetro: diventa la prossima proposta
      - [ ] Note interne: cosa ha funzionato, cosa rifare diversamente

## Fatte
`;

  /* L'elenco. Aggiungerne uno è una voce qui e il suo testo sopra. */
  const DENTRO = [
    { nome: 'sito', descrizione: 'dal brief all\'online, dodici fasi', testo: SITO }
  ];

  const tutti = () => DENTRO.map(m => ({ nome: m.nome, descrizione: m.descrizione, id: 'incorporato:' + m.nome }));

  const testoDi = (id) => {
    const m = DENTRO.find(x => 'incorporato:' + x.nome === id);
    return m ? m.testo : null;
  };

  return { tutti, testoDi };
})();
