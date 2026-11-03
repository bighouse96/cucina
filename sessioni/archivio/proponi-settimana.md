# Brief: proposte per la Settimana

**Obiettivo:** motore locale (niente AI) che propone ricette conosciute, in due fasi.

**Motore di punteggio:** + ingredienti presenti, molto di più se in scadenza (peso crescente al diminuire dei giorni); − ingredienti mancanti; − ricette cucinate/pianificate di recente; ingredienti di base ignorati. Confronto nomi tollerante (singolare/plurale, maiuscole, accenti, "mozzarella di bufala" ≈ "mozzarella"). Gli avanzi occupano per primi un pasto libero prima della loro scadenza.

**Fase 1 – "Proponi tu" su ogni pasto:** 3 proposte con motivo in una riga ("usa la mozzarella che scade domani", "manca solo il basilico"), tasto "Altre".

**Fase 2 – "Proponi settimana":** bozza modificabile e poi conferma; non sovrascrive i pasti già scelti; scala le quantità usate giorno per giorno (le zucchine usate lunedì non valgono martedì); dopo la conferma, tasto per aggiungere alla Spesa gli ingredienti mancanti (dosi scalate sulle persone).

**Persone e ristorante:** impostazione "Quante persone siamo" (predefinito) + numero di persone modificabile per ogni giorno/pasto; un pasto o un giorno si può segnare "Fuori / ristorante": il motore lo salta e non usa nulla dal frigo. Le dosi delle ricette (che hanno già le porzioni) si scalano sul numero di persone del pasto.

**Facoltativo, se resta tempo:** etichette ricetta (veloce, leggera, weekend) usate per pranzo/cena e feriali/weekend.

**File:** `index.html`, `sw.js` (VERSIONE). Se servono nuove chiavi: `secVal`/`applySec`; `firestore.rules` solo se indispensabile (dirlo alla principale).

**Vincoli:** oggi `S.menu` contiene stringhe: i telefoni con la versione vecchia non devono rompersi né cancellare persone/ristorante (valutare un campo separato invece di cambiare il formato). Leggibile con testo grande e palette Pesca e menta. Niente git.

**Quando è finita:** fase 1 mostrata e approvata dall'utente, poi fase 2; provate a 375px; `sessioni/STATO.md` aggiornato sotto "proponi-settimana"; riepilogo alla principale (`local_943197d6-60d5-49f5-83ac-ea887b15f607`) dopo ogni fase approvata, così pubblica.
