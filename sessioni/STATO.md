# Stato dei lavori

## Completato (sessione principale)
- Fasi 1-4: PWA, sincronizzazione Firestore con codice famiglia, guide, pubblicazione su GitHub Pages.
- Ricette: dosi, passi, ingredienti di base, Cucinato!, modalità cucina (commit 6d39ab0).
- Migliorie: testo grande, trascina-per-aggiornare, quantità con unità, Settimana con ricette (commit 9493b75). Da provare su iPhone reale.

## gemini-ai
- Fatto (commit d65a71a, online, cache cucina-v4): Worker `cucina-gemini` su Cloudflare (`worker/`, `GUIDA-GEMINI.md`); «📷 Leggi scontrino» in Frigo e Budget con revisione → frigo e budget; «✨ Da testo/foto» in Cosa cucino → editor già compilato.
- Verificato: online ricetta da testo con Gemini vero (~27 s); scontrino da foto finta col Worker (11–33 s); revisione, Annulla, errori e offline con risposte simulate.
- Da fare: provare su iPhone con scontrino e foto vera (fotocamera/galleria).
- Problemi: `gemini-3.8-flash` spesso sovraccarico, risponde la riserva flash-lite. Aggiornare il Worker: `npx wrangler deploy` in `worker/`.

## grafica
- Fatto: palette «pesca e menta» scelta dall'utente (tra 4 proposte). Sfondo crema, pulsanti pesca con testo scuro (nuove variabili `--btn`/`--btnfg`), dettagli verde menta (`--accent`), anche in modalità scura. Rosso/arancio di stato ritoccati. Contrasto AA verificato (minimo 4.7:1). `manifest.json` e meta `theme-color` aggiornati, icone ricolorate (pentola marrone su pesca). Cache `cucina-v5`.
- Verificato: browser integrato a 375px, chiaro e scuro (Frigo, Cosa cucino, ricetta), nessun errore in console.
- Da fare: approvazione utente, poi commit/push della principale (file: `index.html`, `sw.js`, `manifest.json`, `icons/*.png`). Su iPhone l'icona sulla Home si aggiorna solo reinstallandola.
- Problemi: nessuno.
