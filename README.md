# Gym Tracker

Web app mobile-first per registrare allenamenti in palestra, senza backend. Tutti i dati restano nel browser tramite IndexedDB.

La pagina `/` contiene la landing di presentazione. L’app è disponibile sotto `/dashboard`, con pagina iniziale `/dashboard/oggi`.

## Avvio e verifica

```bash
npm install
npm run dev
```

```bash
npm run test
npm run build
```

## Pubblicazione su GitHub Pages

Il repository è configurato per pubblicare automaticamente su `https://ilbassa.github.io/gym-tracker/` a ogni push sul branch `main`.

1. Su GitHub apri **Settings → Pages**.
2. In **Build and deployment → Source** seleziona **GitHub Actions**.
3. Esegui il push su `main` oppure avvia manualmente **Deploy GitHub Pages** dalla scheda Actions.

La build Pages usa `npm run build:pages`, il base path `/gym-tracker/` e il routing hash per permettere l’apertura diretta delle pagine interne. Lo sviluppo locale continua a usare `npm run dev` sulla root `/`.

## Funzioni

- Inserimento, modifica ed eliminazione di esercizi pesi e cardio.
- Cardio a durata oppure a intervalli/TABATA, con lavoro, pausa tra esercizi, numero di set, pausa tra set ed elenco esercizi.
- Serie multiple con copia automatica dei valori precedenti e modalità totale/per parte.
- Ultima registrazione disponibile e copia dell’ultima sessione pesi.
- Home giornaliera, storico per data e filtri per periodo, tipo ed esercizio.
- Esportazione completa o compatta, copia negli appunti e Web Share API.
- Statistiche generali e per esercizio, con separazione dei carichi totali e per parte.
- Grafici SVG accessibili con valori disponibili anche in forma testuale.
- Gestione esercizi attivi e disattivati.
- Backup e ripristino JSON transazionale, più cancellazione forte dei dati.
- Tema chiaro, scuro o di sistema e impostazioni persistenti.
- PWA installabile, utilizzo offline e applicazione manuale degli aggiornamenti.

## Stato del piano

- Fase 1: completata — progetto, routing, design system, layout e PWA base.
- Fase 2: completata — modelli, Dexie, repository, gestione esercizi e dati demo.
- Fase 3: completata — registrazioni pesi e home giornaliera.
- Fase 4: completata — cardio, storico e filtri.
- Fase 5: completata — esportazione, copia e condivisione.
- Fase 6: completata — statistiche e grafici.
- Fase 7: completata — backup, impostazioni e aggiornamenti PWA.
- Fase 8: completata — test, accessibilità e rifinitura responsive.

## Scelte tecniche

- Vue 3 con Composition API, TypeScript, Pinia e Vue Router.
- Repository dedicati come unico punto di accesso a Dexie dalle funzionalità applicative.
- Schema IndexedDB versionato e snapshot storico del nome esercizio.
- Indice univoco `[type+normalizedName]` per bloccare duplicati equivalenti mantenendo separati pesi e cardio.
- Parser numerico che accetta virgola e punto per i decimali.
- Palette nero/arancione ad alto contrasto e controlli touch da almeno 44 px.
- PWA con aggiornamento esplicito e nessuna cache runtime per servizi esterni.
- Grafici locali senza dipendenze esterne o richieste di rete.

## Dati demo

In sviluppo, la pagina **Altro → Esercizi** mostra il comando per aggiungere gli esercizi demo. I dati demo non vengono caricati automaticamente in produzione.

## Verifica finale

- `npm run test`: 47 test superati in 13 file.
- `npm run build`: completata; manifest e service worker generati, 62 asset in precache.
- `npm audit --omit=dev`: 0 vulnerabilità nelle dipendenze di produzione.
