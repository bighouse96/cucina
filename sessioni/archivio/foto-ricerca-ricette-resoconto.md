## foto-ricerca-ricette
- Brief: `sessioni/foto-ricerca-ricette.md`.
- **Fatto (non committato):** foto ricetta (scheda, editor, miniature) in IndexedDB `cucina-foto` + `famiglie/{codice}/foto/{id}`, JPEG 800 px ≤200000 caratteri; ricetta ha solo `foto: id`. Regola `foto` in `firestore.rules` (**già pubblicata dall'utente**). Worker: `POST /cerca`; app usa /cerca per una riga breve senza foto. `VERSIONE` cucina-v10.
- **Provato a 375px:** foto locale, cambio/rimozione, pulizia foto inutilizzate; sync tra due origini separate (famiglia di prova `ZENF-…`): invio foto fatte prima della famiglia, scarico, cambio, rimozione; ricerca reale «torta al limone per 8» (~25 s, via `wrangler dev --remote`).
- **Ricerca Google:** nel piano gratuito sempre 429 → spenta (`RICERCA_WEB = "no"`); l'app dice che la ricetta viene dalle conoscenze di Gemini.
- **Worker pubblicato** il 3 nov 2026 (versione `b075c2dd`): `/cerca` e `/ricetta` provati dal vivo con origine github.io; altre origini rifiutate.
- **Da fare (principale):** commit/push di `index.html`, `sw.js`, `firestore.rules`, `worker/`, `sessioni/STATO.md`; poi prova su iPhone (anche in modalità aereo).
- **Problemi:** offline non provato nel browser (scritture in coda di Firestore, foto da IndexedDB). Telefoni v9: tengono il campo `foto`, ma se eliminano una ricetta la foto resta sul server.
