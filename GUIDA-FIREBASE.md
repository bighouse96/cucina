# Guida Firebase (una volta sola)

Serve per far sincronizzare l'app tra tutti i familiari. Costa **0 euro** (piano gratuito "Spark"). Ci vogliono circa 15 minuti.

Ti serve un account Google.

---

## 1. Crea il progetto

1. Vai su https://console.firebase.google.com e accedi con Google.
2. Clicca **Crea un progetto** (o "Aggiungi progetto").
3. Scrivi un nome, per esempio `cucina-di-casa`. Clicca **Continua**.
4. Google Analytics: **spegni l'interruttore** (non serve). Clicca **Crea progetto**.
5. Aspetta, poi clicca **Continua**.

## 2. Aggiungi l'app Web

1. Nella pagina iniziale del progetto clicca l'icona **Web** (si legge `</>`).
2. Scrivi un nome, per esempio `cucina-web`.
3. **Non** spuntare "Firebase Hosting".
4. Clicca **Registra app**.
5. Compare un riquadro di codice con `const firebaseConfig = { ... }`.
6. Copia **solo la parte tra le parentesi graffe `{ ... }`** (apiKey, authDomain, projectId, storageBucket, messagingSenderId, appId).
7. Apri il file `firebase-config.js` nella cartella dell'app e **sostituisci i segnaposto** con i tuoi valori. Salva.
8. Torna nella console e clicca **Continua alla console**.

> **La apiKey non è un segreto.** Nelle app web è normale che sia visibile a tutti. La sicurezza dei dati la danno le *Regole* (passo 4) e l'accesso anonimo, non la chiave. Puoi pubblicarla su GitHub senza paura.

## 3. Crea il database Firestore

1. Nel menu a sinistra clicca **Compila** (o "Build"), poi **Firestore Database**.
2. Clicca **Crea database**.
3. Scegli la posizione (regione): **eur3 (Europe)**. Questa scelta non si può cambiare dopo. Clicca **Avanti**.
4. Scegli **Avvia in modalità produzione**. Clicca **Crea**.
5. Aspetta che finisca.

## 4. Incolla le Regole

1. In Firestore Database clicca la scheda **Regole**.
2. Cancella tutto il testo che c'è.
3. Apri il file `firestore.rules` della cartella dell'app, copia **tutto** il contenuto e incollalo.
4. Clicca **Pubblica**.

## 5. Attiva l'accesso anonimo

1. Nel menu a sinistra: **Compila → Authentication**.
2. Clicca **Inizia**.
3. Scheda **Metodo di accesso** (Sign-in method) → clicca **Anonimo**.
4. Attiva l'interruttore **Abilita** e clicca **Salva**.

(Nessuno dovrà fare login con email o password: l'app entra da sola.)

## 6. Autorizza il sito su GitHub

1. In **Authentication** clicca la scheda **Impostazioni**.
2. Clicca **Domini autorizzati**.
3. Clicca **Aggiungi dominio**.
4. Scrivi `bighouse96.github.io` (**senza** `https://` e senza `/nome-repository`).
5. Clicca **Aggiungi**.

## 7. Prova

1. Carica i file su GitHub e apri il link dell'app.
2. Tocca **Crea nuova famiglia**.
3. In **Impostazioni** vedi il codice `xxxx-xxxx-xxxx-xxxx`. Copialo e mandalo ai familiari.
4. Loro aprono l'app e scelgono **Entra con codice**. (Per l'iPhone gira loro `GUIDA-IPHONE.md`.)

---

## Problemi comuni

**"Missing or insufficient permissions" / i dati non si salvano**
- Controlla di aver premuto **Pubblica** nelle Regole (passo 4).
- Controlla di aver incollato tutto il file `firestore.rules`, senza pezzi mancanti.

**Errore "auth/operation-not-allowed" o "admin-restricted-operation"**
- L'accesso Anonimo non è attivo. Rifai il passo 5.

**Errore "auth/unauthorized-domain"**
- Manca il dominio. Rifai il passo 6. Scrivi proprio `bighouse96.github.io`, senza `https://`.

**L'app dice che Firebase non è configurato / pagina bianca**
- In `firebase-config.js` ci sono ancora i segnaposto, oppure hai copiato male (virgolette o virgole mancanti). Ricopia i valori.
- Dopo aver modificato il file, ricarica i file su GitHub e aspetta 1-2 minuti.

**Ho cambiato il file ma l'app mostra ancora la versione vecchia**
- GitHub Pages impiega 1-2 minuti. Poi chiudi l'app del tutto e riaprila (sull'iPhone anche due volte).

**I familiari non vedono i miei dati**
- Devono usare **lo stesso codice** (xxxx-xxxx-xxxx-xxxx). Controlla trattini e lettere.
- Devono avere internet almeno la prima volta.

**Ho perso il codice famiglia**
- Aprilo da un telefono dove l'app funziona: **Impostazioni** → codice → copia.

**Limiti del piano gratuito**
- Per una famiglia sono ampiamente sufficienti. Nella console, in **Utilizzo**, puoi controllare i consumi.
