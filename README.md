https://silviamartinelli.github.io/nutrition.sm

# Studio — gestione pazienti e diete

App web semplice, senza server, per tenere lo storico dei pazienti, calcolare
il fabbisogno calorico e organizzare diete/opuscoli e appuntamenti.

## Funzioni

- **Pazienti**: anagrafica, storico visite in tabella, grafico dell'andamento
  (peso, BMI, vita, fianchi, massa grassa, fabbisogno), anamnesi e note.
- **Visite**: per ogni visita registri altezza, peso, età, giro vita, fianchi,
  coscia e le 6 pliche (tricipite, bicipite, sottoscapolare, soprailiaca,
  addominale, coscia). L'app calcola automaticamente:
  - BMI
  - massa grassa % (formula di Durnin–Womersley sulle 4 pliche principali)
  - metabolismo basale, scegliendo tra **Mifflin–St Jeor**, **Harris–Benedict**
    e **Katch–McArdle** da un menu a tendina
  - peso ideale, scegliendo tra **Lorentz**, **Devine**, **Robinson** e
    **Broca corretta**
  - fabbisogno calorico attuale (metabolismo basale × livello di attività)
  - fabbisogno calorico ideale (stesso calcolo sul peso ideale)
- **Diete** (dentro la scheda paziente, accanto al grafico): componi un piano
  alimentare settimanale giorno per giorno e pasto per pasto scegliendo gli
  alimenti da un database di riferimento (~150 alimenti comuni). L'app
  calcola automaticamente kcal, proteine, carboidrati, grassi e fibra per
  ogni pasto, giorno e media settimanale, e la confronta con il fabbisogno
  calorico calcolato nell'ultima visita del paziente. Puoi aggiungere
  qualunque alimento mancante con i tuoi valori, copiare il piano come testo
  o stamparlo. Puoi salvare più piani per lo stesso paziente nel tempo.
- **Modelli**: un archivio di diete standard e opuscoli riutilizzabili, con
  categorie, tag e ricerca.
- **Calendario**: vista mensile degli appuntamenti, collegati ai pazienti.
- **Backup**: i dati restano solo nel browser (localStorage). Usa
  "Esporta backup" per scaricare un file `.json` di sicurezza e
  "Importa backup" per ripristinarlo — anche su un altro computer.

## Come metterla online con GitHub Pages

1. Crea un nuovo repository su GitHub (può essere privato, se preferisci che
   non sia visibile ad altri).
2. Carica questi file nella radice del repository: `index.html`,
   `style.css`, `app.js`, `foods.js` (e questo `README.md`, opzionale).
3. Nel repository vai su **Settings → Pages**.
4. In "Build and deployment" scegli **Deploy from a branch**, branch
   `main`, cartella `/root`, poi **Save**.
5. Dopo un minuto GitHub mostrerà l'indirizzo pubblico, del tipo
   `https://tuonome.github.io/nome-repo/`.

Puoi anche aprire `index.html` direttamente nel browser dal tuo computer,
senza pubblicarlo online: funziona allo stesso modo.

## Nota importante sui dati

Questa è un'applicazione **solo client**: non esiste un server, quindi i dati
non vengono inviati né salvati da nessuna parte fuori dal tuo browser. Questo
significa anche che:

- i dati sono legati a **questo browser, su questo computer** — se apri l'app
  da un altro dispositivo o un altro browser, non li troverai;
- svuotare la cache/i dati del browser cancella i dati dell'app;
- se lavori da più postazioni o vuoi un accesso condiviso/multi-utente, serve
  un backend con un database vero (posso aiutarti a costruirlo se ti serve).

Per questo conviene esportare un backup regolarmente (ad es. ogni settimana)
e conservarlo in un posto sicuro.

## Formule usate

- **Mifflin–St Jeor**: la più raccomandata in letteratura per la popolazione
  generale.
- **Harris–Benedict** (revisione 1984): storica, tende a sovrastimare
  leggermente.
- **Katch–McArdle**: si basa sulla massa magra (richiede quindi la massa
  grassa calcolata dalle pliche) ed è indicata per persone con composizione
  corporea nota.
- **Massa grassa**: formula di Durnin & Womersley a 4 pliche (tricipite,
  bicipite, sottoscapolare, soprailiaca) con equazione di Siri per la densità
  corporea; richiede queste 4 misure compilate.
- **Peso ideale**: Lorentz, Devine, Robinson, Broca corretta — quattro
  riferimenti classici, scegli quello che usi abitualmente.

Queste sono stime di supporto alla valutazione clinica, non sostituiscono il
giudizio professionale.

## Database alimenti (per il piano dietetico)

I valori nutrizionali usati nella scheda "Diete" (`foods.js`) sono un elenco
indipendente di valori medi tipici, compilato per uso pratico — **non** è
un'estrazione delle tabelle ufficiali CREA di alimentinutrizione.it, che
dichiara espressamente di non poter essere copiato/riprodotto. Per la
massima precisione su un caso clinico specifico, confronta il valore con le
[tabelle ufficiali CREA](https://www.alimentinutrizione.it/tabelle-nutrizionali/ricerca-per-alimento)
e correggilo direttamente nell'app (pulsante "+ nuovo alimento", che
sovrascrive un alimento esistente con lo stesso nome).
