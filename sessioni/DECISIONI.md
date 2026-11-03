# Decisioni

- Hosting: GitHub Pages (repo `bighouse96/cucina`, branch `main`), non Netlify.
- Sync: Firestore piano gratuito + login anonimo; codice famiglia `XXXX-XXXX-XXXX-XXXX` come segreto condiviso.
- Dati: un documento per sezione in `famiglie/{codice}/sezioni/{nome}`; telefoni vecchi non devono perdere campi nuovi.
- AI: Gemini piano gratuito tramite Worker Cloudflare `cucina-gemini` (chiave solo nei secret).
- Proposte settimana: motore locale, niente AI.
- Grafica: palette «Pesca e menta», pulsanti chiari con testo scuro, contrasto AA.
- Git: commit e push solo la sessione principale.
- Figlie: partono ferme, l'utente imposta modello/impegno e dà l'ok.
- Service worker: shell scaricata con `cache: "reload"`; ogni modifica a `index.html` aumenta `VERSIONE`.
