# Cucina di Casa

PWA per la cucina di famiglia: `index.html` (app intera), `sw.js` (offline), `firebase-config.js` + `firestore.rules` (sincronizzazione), `worker/` (Cloudflare Worker per Gemini). Online su https://bighouse96.github.io/cucina/ (GitHub Pages, branch `main`).

## Regole per le sessioni
- **Commit e push li fa solo la sessione principale.** Le figlie modificano i file e provano in locale, ma non eseguono `git commit`, `git push` né controlli git.
- Ogni modifica a `index.html` richiede di aumentare `VERSIONE` in `sw.js`.
- Non rompere la sincronizzazione: le sezioni si salvano con `persist()`; i dati dei telefoni con versioni vecchie non devono andare persi.
- Mai segreti nel repository (la chiave Gemini sta solo nei secret del Worker).
- A fine lavoro la figlia aggiorna `sessioni/STATO.md` sotto il proprio nome (fatto, punto raggiunto, da fare, problemi) e avvisa la principale.
- Utente italiano non programmatore: spiegazioni semplici, in italiano.
