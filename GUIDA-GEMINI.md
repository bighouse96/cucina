# Gemini per scontrini e ricette

L'app manda la foto a un piccolo servizio tuo su Cloudflare (`worker/`), che la passa a Gemini con la chiave segreta. La chiave non sta mai nell'app né su GitHub. Tutto gratuito.

## 1. Chiave Gemini (5 minuti)
1. Apri **aistudio.google.com** e accedi con il tuo account Google.
2. In basso a sinistra: **Get API key** → **Create API key** → scegli/crea un progetto.
3. Copia la chiave (inizia con `AIza…`). Tienila per il punto 3.
4. Non attivare la fatturazione: senza, non puoi spendere nulla. I limiti gratuiti li vedi in AI Studio → **Rate limit**.

## 2. Account Cloudflare
1. Vai su **dash.cloudflare.com/sign-up**, registrati e conferma l'email.
2. Nel menu a sinistra apri **Compute (Workers) → Workers & Pages** una volta, così si crea il tuo indirizzo `….workers.dev`.
3. Avvisa Claude: pubblica lui il Worker. Si aprirà una pagina Cloudflare: clicca **Allow**.

## 3. Incolla la chiave
1. In **Workers & Pages** apri **cucina-gemini** → **Settings** → **Variables and Secrets** → **Add**.
2. Type **Secret**, Name `GEMINI_KEY`, Value: incolla la chiave → **Deploy**.

## Se qualcosa non va
- «Limite gratuito raggiunto»: riprova il giorno dopo.
- Chiave rubata o persa: in AI Studio cancellala, creane una nuova e ripeti il punto 3.
- Aggiornare il Worker: da questa cartella `npx wrangler deploy` dentro `worker/`.
