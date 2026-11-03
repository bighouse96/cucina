# Brief: foto nelle ricette e ricerca con Gemini

**1. Foto della ricetta**
- Ogni ricetta può avere una foto (fotocamera o galleria), mostrata in elenco (miniatura) e nella scheda; si può cambiare o togliere.
- Le ricette stanno tutte in un unico documento (limite 1 MB): la foto NON va lì. Salvarla compressa sul telefono (es. JPEG ~800px, max ~150 KB) in un documento a parte `famiglie/{codice}/foto/{id}`; nella ricetta solo il riferimento.
- Niente Firebase Storage (richiede il piano a pagamento).
- Serve una nuova regola in `firestore.rules` per `foto` (stesse condizioni delle sezioni, dimensione limitata). Spiega all'utente, passo passo, come ripubblicarla nella console Firebase.
- Funziona offline e si sincronizza; i telefoni vecchi ignorano il campo nuovo senza perderlo.

**2. Cerca ricetta con Gemini**
- Nel riquadro «✨ Da testo/foto», se l'utente scrive una richiesta (es. «torta al limone») invece di una ricetta, Gemini propone una ricetta completa (porzioni, ingredienti con dosi, passi) nell'editor già compilato, da rivedere prima di salvare.
- Valuta la ricerca Google (grounding) del piano gratuito, mostrando la fonte; se non è disponibile o è troppo limitata, usa la conoscenza del modello e dillo nell'interfaccia.
- Aggiorna il Worker (`worker/`) e pubblicalo con `npx wrangler deploy` (già loggato su questo PC).

**File assegnati:** `index.html`, `sw.js` (VERSIONE), `firestore.rules`, `worker/`, `GUIDA-GEMINI.md` se serve.

**Vincoli:** `CLAUDE.md` (niente git, sync intatta, nessun segreto); contrasto e testo grande come ora.

**Quando è finita:** provata nel browser integrato a 375px (foto, sync tra due schede, ricerca reale con Gemini); utente approva; `sessioni/STATO.md` aggiornato sotto «foto-ricerca-ricette»; riepilogo alla principale (`local_943197d6-60d5-49f5-83ac-ea887b15f607`).
