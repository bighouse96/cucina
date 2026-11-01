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

## riordino
- Fatto: Frigo con filtro a pulsanti Tutte/Frigo/Freezer/Dispensa (scelta ricordata sul telefono, avvisi sempre visibili); Spesa con Budget in cima; Cosa cucino con «Nuova ricetta» e «✨ Da testo/foto» sopra la lista e ricerca per nome/ingredienti (senza maiuscole/accenti). Cache `cucina-v6`. File: `index.html`, `sw.js`.
- Verificato: browser integrato a 375px, scuro e chiaro, filtro, ricerca, nessun errore in console. Dati e sincronizzazione non toccati.
- Da fare: approvazione utente, poi commit/push della principale.
- Problemi: nessuno.

## proponi-settimana
- Fatto (fase 1, cache `cucina-v7`, file `index.html`, `sw.js`): toccando un pasto nella Settimana compare «💡 Proponi tu» con 3 proposte e il motivo in una riga, tasto «↻ Altre proposte». Motore locale: + ingredienti in casa (molto di più se scadono entro il giorno del pasto), − da comprare, − cucinata da poco o già in settimana; avanzi per primi se ancora buoni quel giorno; ingredienti di base ignorati. Nomi tolleranti (`stessoIng`: accenti, singolare/plurale, «mozzarella di bufala» ≈ «mozzarella», «petto di pollo» ≈ «pollo»), usati anche da «Cosa cucino», scheda ricetta e «Cucinato!». «Cucinato!» salva `fatta` (data) nella ricetta: campo in più, le versioni vecchie lo conservano. Niente nuove sezioni né regole Firestore.
- Verificato: browser integrato a 375px, chiaro e scuro, nessun errore in console.
- Da fare: approvazione utente della fase 1 → commit/push della principale; poi fase 2 («Proponi settimana», persone, ristorante).
- Problemi: nessuno.
