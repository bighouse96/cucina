/* Cucina di Casa – proxy verso Gemini.
   La chiave sta nel secret GEMINI_KEY (mai nel codice).
   Endpoint:
     POST /scontrino  {immagine:"data:image/jpeg;base64,..."}
     POST /ricetta    {testo:"..."} oppure {immagine:"data:..."} (o entrambi)
   Risposta: {ok:true, dati:{...}} oppure {ok:false, errore:"messaggio in italiano"} */

const ORIGINI_DEFAULT = "https://bighouse96.github.io";
const MODELLI_DEFAULT = "gemini-3.8-flash,gemini-3.5-flash-lite"; // il secondo è la riserva se il primo è esaurito
const MAX_BODY = 6_000_000;      // byte della richiesta
const MAX_IMMAGINE = 4_000_000;  // caratteri base64 (~3 MB di foto)
const MAX_TESTO = 12_000;        // caratteri di ricetta incollata
const LIMITE_RICHIESTE = 30;     // per indirizzo IP...
const FINESTRA_MS = 10 * 60_000; // ...ogni 10 minuti
const ATTESA_MS = 25_000;        // tempo massimo per modello, poi si passa alla riserva

/* ---------- Schemi della risposta ---------- */
const S = (type, extra = {}) => ({ type, ...extra });

const SCHEMA_SCONTRINO = S("OBJECT", {
  properties: {
    negozio: S("STRING", { nullable: true, description: "Nome del negozio, se leggibile" }),
    data: S("STRING", { nullable: true, description: "Data dello scontrino AAAA-MM-GG, se leggibile" }),
    totale: S("NUMBER", { nullable: true, description: "Totale pagato in euro" }),
    prodotti: S("ARRAY", {
      items: S("OBJECT", {
        properties: {
          nome: S("STRING", { description: "Nome semplice in italiano, es. «Latte intero», «Mozzarella»" }),
          q: S("NUMBER", { nullable: true, description: "Quantità acquistata (contenuto totale)" }),
          u: S("STRING", { enum: ["pz", "g", "kg", "ml", "l", "conf."] }),
          prezzo: S("NUMBER", { nullable: true, description: "Prezzo pagato per la riga, in euro, sconti inclusi" }),
          reparto: S("STRING", { enum: ["Frigo", "Freezer", "Dispensa"] }),
          giorni: S("INTEGER", { nullable: true, description: "Giorni di conservazione tipici da oggi; null se non scade in tempi utili" }),
        },
        required: ["nome", "q", "u", "prezzo", "reparto", "giorni"],
        propertyOrdering: ["nome", "q", "u", "prezzo", "reparto", "giorni"],
      }),
    }),
  },
  required: ["negozio", "data", "totale", "prodotti"],
  propertyOrdering: ["negozio", "data", "totale", "prodotti"],
});

const SCHEMA_RICETTA = S("OBJECT", {
  properties: {
    nome: S("STRING"),
    porzioni: S("INTEGER", { description: "Numero di porzioni; 2 se non indicato" }),
    ingredienti: S("ARRAY", {
      items: S("OBJECT", {
        properties: {
          n: S("STRING", { description: "Nome dell'ingrediente, minuscolo, senza quantità" }),
          q: S("NUMBER", { nullable: true }),
          u: S("STRING", { enum: ["g", "kg", "ml", "l", "pz", "cucchiai", "cucchiaini", "q.b."] }), // Gemini non accetta "" nell'enum
        },
        required: ["n", "q", "u"],
        propertyOrdering: ["n", "q", "u"],
      }),
    }),
    passi: S("ARRAY", { items: S("STRING") }),
  },
  required: ["nome", "porzioni", "ingredienti", "passi"],
  propertyOrdering: ["nome", "porzioni", "ingredienti", "passi"],
});

/* ---------- Istruzioni (in italiano) ---------- */
const PROMPT_SCONTRINO = `Sei l'assistente di una famiglia italiana. Leggi la foto di uno scontrino della spesa.
Elenca SOLO i prodotti alimentari e le bevande (escludi detersivi, igiene, casa, sacchetti, buoni, resi).
Per ogni prodotto:
- nome: nome comune e breve in italiano, con la maiuscola iniziale, senza marca né sigle (es. "LATTE PS UHT GRAN" → "Latte parzialmente scremato").
- q e u: quantità totale acquistata. Usa il peso/volume se scritto (g, kg, ml, l), altrimenti il numero di pezzi (pz) o confezioni (conf.). Se la riga è ripetuta o ha "x2", somma.
- prezzo: importo pagato per quella riga in euro, sottraendo eventuali sconti riferiti a quella riga.
- reparto: "Frigo" per freschi (latticini, carne, pesce, salumi, verdura e frutta deperibili), "Freezer" per surgelati e gelati, "Dispensa" per il resto.
- giorni: giorni tipici prima di consumarlo dalla data di acquisto (es. latte fresco 5, yogurt 20, carne 3, insalata 4, surgelati 180, pasta 365). null per prodotti che durano anni (sale, zucchero).
Indica anche negozio, data (AAAA-MM-GG) e totale se leggibili, altrimenti null.
Non inventare: se una riga è illeggibile, saltala. Se non è uno scontrino, restituisci prodotti vuoto.`;

const PROMPT_RICETTA = `Sei l'assistente di una famiglia italiana. Dal testo e/o dalla foto ricava una ricetta strutturata in italiano.
- nome: titolo breve della ricetta.
- porzioni: numero di persone/porzioni indicato; se manca, 2.
- ingredienti: uno per riga. n = nome minuscolo senza quantità; q = numero (usa il punto per i decimali, es. 0.5); u = unità.
  Converti: "un cucchiaio" → q 1 u "cucchiai"; "mezzo litro" → q 0.5 u "l"; "2 uova" → q 2 u "pz"; "un pizzico", "quanto basta", "q.b." → q null u "q.b.".
  Se c'è un'unità diversa (bicchiere, tazza, spicchio, foglia) convertila in modo ragionevole in g, ml o pz.
- passi: il procedimento diviso in passi brevi e chiari, nell'ordine, senza numerazione.
Non inventare ingredienti che non ci sono. Se il contenuto non è una ricetta, restituisci ingredienti e passi vuoti e nome "".`;

/* ---------- Utilità ---------- */
const origini = env => (env.ORIGINI || ORIGINI_DEFAULT).split(",").map(s => s.trim()).filter(Boolean);

function cors(origin, env) {
  const h = { "Vary": "Origin" };
  if (origin && origini(env).includes(origin)) {
    h["Access-Control-Allow-Origin"] = origin;
    h["Access-Control-Allow-Methods"] = "POST, OPTIONS";
    h["Access-Control-Allow-Headers"] = "Content-Type";
    h["Access-Control-Max-Age"] = "86400";
  }
  return h;
}

function risposta(corpo, stato, origin, env) {
  return new Response(JSON.stringify(corpo), {
    status: stato,
    headers: { "Content-Type": "application/json; charset=utf-8", ...cors(origin, env) },
  });
}
const errore = (msg, stato, origin, env) => risposta({ ok: false, errore: msg }, stato, origin, env);

// Limite semplice per IP (in memoria: vale per singola istanza, basta contro gli abusi banali).
// Se in wrangler.toml c'è il binding LIMITE (Rate Limiting di Cloudflare) si usa quello.
const visti = new Map();
async function troppeRichieste(ip, env) {
  if (env.LIMITE && typeof env.LIMITE.limit === "function") {
    const { success } = await env.LIMITE.limit({ key: ip });
    return !success;
  }
  const ora = Date.now();
  const lista = (visti.get(ip) || []).filter(t => ora - t < FINESTRA_MS);
  lista.push(ora);
  visti.set(ip, lista);
  if (visti.size > 5000) visti.clear();
  return lista.length > LIMITE_RICHIESTE;
}

function leggiImmagine(s) {
  if (typeof s !== "string") return null;
  const m = s.match(/^data:(image\/(?:jpeg|png|webp|heic|heif));base64,([A-Za-z0-9+/=]+)$/);
  if (!m) return { errore: "Formato immagine non riconosciuto: usa una foto JPEG o PNG." };
  if (m[2].length > MAX_IMMAGINE) return { errore: "La foto è troppo grande. Riprova: l'app la rimpicciolisce da sola." };
  return { mime: m[1], dati: m[2] };
}

async function chiediGemini(env, parti, schema) {
  if (!env.GEMINI_KEY) return { errore: "Il servizio non è configurato (manca la chiave Gemini).", stato: 500 };
  const modelli = (env.MODELLI || MODELLI_DEFAULT).split(",").map(s => s.trim()).filter(Boolean);
  const corpo = JSON.stringify({
    contents: [{ role: "user", parts: parti }],
    generationConfig: { responseMimeType: "application/json", responseSchema: schema, temperature: 0.1 },
  });
  let ultimo = null;
  for (const modello of modelli) {
    let r;
    try {
      r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${modello}:generateContent`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-goog-api-key": env.GEMINI_KEY },
        body: corpo,
        signal: AbortSignal.timeout(ATTESA_MS),
      });
    } catch (e) {
      console.log(`Gemini ${modello}: ${e.name}`);
      ultimo = { errore: "Gemini non risponde. Riprova tra poco.", stato: 504 };
      continue;
    }
    if (r.ok) {
      const j = await r.json();
      const cand = j.candidates && j.candidates[0];
      const testo = cand && cand.content && cand.content.parts && cand.content.parts.map(p => p.text || "").join("");
      if (!testo) {
        const motivo = (cand && cand.finishReason) || (j.promptFeedback && j.promptFeedback.blockReason) || "vuota";
        return { errore: `Gemini non ha dato una risposta utilizzabile (${motivo}). Prova con una foto più nitida.`, stato: 502 };
      }
      try { return { dati: JSON.parse(testo), modello }; }
      catch { return { errore: "Risposta di Gemini non valida. Riprova.", stato: 502 }; }
    }
    const dettaglio = (await r.text()).slice(0, 300);
    console.log(`Gemini ${modello} ${r.status}: ${dettaglio}`);
    if (r.status === 429 || r.status === 404 || r.status >= 500) {
      ultimo = r.status === 429
        ? { errore: "Limite gratuito di Gemini raggiunto per ora. Riprova più tardi (si azzera ogni giorno).", stato: 429 }
        : { errore: "Gemini è occupato in questo momento. Riprova tra un minuto.", stato: 503 };
      continue; // prova il modello di riserva
    }
    if (r.status === 400 && /API key/i.test(dettaglio)) return { errore: "La chiave Gemini non è valida: controlla il secret GEMINI_KEY.", stato: 500 };
    if (r.status === 403) return { errore: "La chiave Gemini non ha accesso a questo modello.", stato: 500 };
    return { errore: `Errore di Gemini (${r.status}). Riprova.`, stato: 502 };
  }
  return ultimo || { errore: "Nessun modello disponibile.", stato: 500 };
}

/* ---------- Pulizia dei risultati ---------- */
const num = x => (typeof x === "number" && isFinite(x) && x > 0 ? Math.round(x * 1000) / 1000 : null);
const testo = (x, max = 200) => String(x ?? "").replace(/\s+/g, " ").trim().slice(0, max);

function pulisciScontrino(d) {
  const prodotti = (Array.isArray(d.prodotti) ? d.prodotti : []).map(p => ({
    nome: testo(p.nome, 80),
    q: num(p.q),
    u: ["pz", "g", "kg", "ml", "l", "conf."].includes(p.u) ? p.u : "pz",
    prezzo: num(p.prezzo) === null ? null : Math.round(p.prezzo * 100) / 100,
    reparto: ["Frigo", "Freezer", "Dispensa"].includes(p.reparto) ? p.reparto : "Dispensa",
    giorni: Number.isInteger(p.giorni) && p.giorni > 0 ? Math.min(p.giorni, 3650) : null,
  })).filter(p => p.nome);
  const data = /^\d{4}-\d{2}-\d{2}$/.test(d.data || "") ? d.data : null;
  return { negozio: d.negozio ? testo(d.negozio, 60) : null, data, totale: num(d.totale), prodotti };
}

function pulisciRicetta(d) {
  const ingredienti = (Array.isArray(d.ingredienti) ? d.ingredienti : []).map(x => {
    const u = ["", "g", "kg", "ml", "l", "pz", "cucchiai", "cucchiaini", "q.b."].includes(x.u) ? x.u : "";
    return { n: testo(x.n, 80).toLowerCase(), q: u === "q.b." ? null : num(x.q), u };
  }).filter(x => x.n);
  const passi = (Array.isArray(d.passi) ? d.passi : []).map(p => testo(p, 1000)).filter(Boolean);
  const porzioni = Number.isInteger(d.porzioni) && d.porzioni > 0 && d.porzioni <= 50 ? d.porzioni : 2;
  return { nome: testo(d.nome, 80), porzioni, ingredienti, passi };
}

/* ---------- Gestore ---------- */
export default {
  async fetch(request, env) {
    const origin = request.headers.get("Origin");
    const url = new URL(request.url);

    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: cors(origin, env) });
    if (request.method === "GET" && url.pathname === "/") return risposta({ ok: true, servizio: "Cucina di Casa" }, 200, origin, env);
    if (!origin || !origini(env).includes(origin)) return errore("Origine non autorizzata.", 403, origin, env);
    if (request.method !== "POST") return errore("Metodo non consentito.", 405, origin, env);
    if (url.pathname !== "/scontrino" && url.pathname !== "/ricetta") return errore("Indirizzo sconosciuto.", 404, origin, env);

    const ip = request.headers.get("CF-Connecting-IP") || "sconosciuto";
    if (await troppeRichieste(ip, env)) return errore("Troppe richieste ravvicinate. Aspetta qualche minuto.", 429, origin, env);

    const lung = Number(request.headers.get("Content-Length") || 0);
    if (lung > MAX_BODY) return errore("La foto è troppo grande.", 413, origin, env);
    let corpo;
    try {
      const raw = await request.text();
      if (raw.length > MAX_BODY) return errore("La foto è troppo grande.", 413, origin, env);
      corpo = JSON.parse(raw);
    } catch { return errore("Richiesta non valida.", 400, origin, env); }

    const parti = [];
    let img = null;
    if (corpo.immagine) {
      img = leggiImmagine(corpo.immagine);
      if (img.errore) return errore(img.errore, 400, origin, env);
    }

    if (url.pathname === "/scontrino") {
      if (!img) return errore("Manca la foto dello scontrino.", 400, origin, env);
      parti.push({ text: PROMPT_SCONTRINO }, { inline_data: { mime_type: img.mime, data: img.dati } });
      const r = await chiediGemini(env, parti, SCHEMA_SCONTRINO);
      if (r.errore) return errore(r.errore, r.stato, origin, env);
      return risposta({ ok: true, modello: r.modello, dati: pulisciScontrino(r.dati) }, 200, origin, env);
    }

    // /ricetta
    const t = typeof corpo.testo === "string" ? corpo.testo.trim() : "";
    if (!t && !img) return errore("Scrivi il testo della ricetta o scegli una foto.", 400, origin, env);
    if (t.length > MAX_TESTO) return errore("Il testo è troppo lungo.", 413, origin, env);
    parti.push({ text: PROMPT_RICETTA });
    if (t) parti.push({ text: "Testo della ricetta:\n" + t });
    if (img) parti.push({ inline_data: { mime_type: img.mime, data: img.dati } });
    const r = await chiediGemini(env, parti, SCHEMA_RICETTA);
    if (r.errore) return errore(r.errore, r.stato, origin, env);
    return risposta({ ok: true, modello: r.modello, dati: pulisciRicetta(r.dati) }, 200, origin, env);
  },
};
