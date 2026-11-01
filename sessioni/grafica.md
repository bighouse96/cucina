# Brief: nuova palette colori

**Obiettivo:** sostituire il verde militare con colori tenui ma allegri (pastello caldi, es. pesca, menta chiara, giallo burro, azzurro cielo). Pulsanti chiari e leggibili: oggi il testo bianco su verde lime si legge male.

**File:** `index.html` (variabili CSS in `:root` e regole collegate), `manifest.json` (`theme_color`, `background_color`), meta `theme-color`, eventualmente icone in `icons/` se stonano. Aumentare `VERSIONE` in `sw.js`.

**Vincoli:**
- Contrasto testo/sfondo almeno WCAG AA (4.5:1) ovunque, pulsanti compresi: testo scuro su pulsanti chiari.
- Mantenere modalità chiara e scura se presenti; colori di stato (scaduto rosso, in scadenza, "da compilare" rosso) restano riconoscibili.
- Non toccare logica né sincronizzazione; funziona con testo grande iOS.
- Niente git: commit e push li fa la sessione principale.

**Quando è finita:** provata nel browser integrato a 375px in chiaro e scuro, con 2-3 screenshot mostrati all'utente; l'utente approva; `sessioni/STATO.md` aggiornato sotto "grafica"; riepilogo mandato alla principale (`local_943197d6-60d5-49f5-83ac-ea887b15f607`).
