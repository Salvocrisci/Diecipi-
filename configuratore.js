/* Dieci Più — Costruisci la tua soluzione
   Configuratore di servizi: nessun prezzo, nessun carrello.
   Raccoglie le esigenze e prepara la richiesta di proposta su WhatsApp. */

/* ------------------------------------------------------------------
   CATALOGO SERVIZI — unico punto da modificare.
   Ogni servizio: id, nome, descrizione, opzioni.
   Tipi di opzione:
     qty    → quantità con + e − (min, max, step, def, unit)
     multi  → scelta multipla a chip (choices, def, min = scelte minime)
     single → scelta singola (choices, def)
     check  → sì / no (def)
   Tutti i servizi qui sotto sono quelli già offerti sul sito.
   ------------------------------------------------------------------ */
const CATALOGO_SERVIZI = [
  {
    id: "reel", nome: "Produzione reel",
    desc: "Reel verticali girati nella tua attività: idea, testi, riprese e montaggio.",
    opzioni: [
      { key: "qty", type: "qty", label: "Reel al mese", unit: "reel al mese", min: 1, max: 20, step: 1, def: 4 },
      { key: "titolare", type: "check", label: "Il titolare in video, con testi scritti da noi", short: "titolare in video", def: false },
    ],
  },
  {
    id: "storie", nome: "Storie Instagram",
    desc: "Storie durante il mese per restare presente ogni settimana.",
    opzioni: [
      { key: "qty", type: "qty", label: "Storie al mese", unit: "storie al mese", min: 4, max: 30, step: 2, def: 12 },
    ],
  },
  {
    id: "social", nome: "Gestione social",
    desc: "Pubblicazione e cura dei profili: calendario, testi, programmazione.",
    opzioni: [
      { key: "canali", type: "multi", label: "Canali", choices: ["Instagram", "Facebook", "TikTok", "YouTube Shorts"], def: ["Instagram"], min: 1 },
      { key: "post", type: "qty", label: "Post foto o caroselli al mese", unit: "post al mese", min: 0, max: 12, step: 1, def: 4 },
      { key: "risposte", type: "check", label: "Risposte a commenti e messaggi", short: "risposte a commenti e messaggi", def: false },
    ],
  },
  {
    id: "foto", nome: "Servizio fotografico",
    desc: "Foto professionali dell'attività e dei prodotti, ritoccate.",
    opzioni: [
      { key: "qty", type: "qty", label: "Foto al mese", unit: "foto al mese", min: 10, max: 60, step: 10, def: 20 },
    ],
  },
  {
    id: "video", nome: "Video di presentazione",
    desc: "Un video da 60–90 secondi che racconta la tua attività.",
    opzioni: [
      { key: "qty", type: "qty", label: "Video al mese", unit: "video al mese", min: 1, max: 4, step: 1, def: 1 },
    ],
  },
  {
    id: "sito", nome: "Realizzazione sito web",
    desc: "Un sito per farti trovare e contattare: WhatsApp, mappa e collegamento a Google.",
    opzioni: [
      { key: "tipo", type: "single", label: "Tipologia", choices: ["Sito di una pagina", "Sito vetrina, fino a 5 pagine"], def: "Sito di una pagina" },
      { key: "manutenzione", type: "check", label: "Manutenzione: aggiornamenti, modifiche e sicurezza", short: "con manutenzione", def: false },
    ],
  },
  {
    id: "google", nome: "Google Business Profile",
    desc: "La tua scheda su Google e Maps curata e aggiornata.",
    opzioni: [
      { key: "attivita", type: "multi", label: "Cosa curiamo", choices: ["Foto", "Post", "Risposte alle recensioni"], def: ["Foto", "Post", "Risposte alle recensioni"], min: 1 },
    ],
  },
  {
    id: "ads", nome: "Campagne pubblicitarie",
    desc: "Pubblicità a pagamento impostata e seguita da noi. Il budget pubblicitario è tuo, separato dai nostri compensi.",
    opzioni: [
      { key: "canali", type: "multi", label: "Canali", choices: ["Meta (Facebook e Instagram)"], def: ["Meta (Facebook e Instagram)"], min: 1 },
      { key: "budget", type: "single", label: "Budget pubblicitario orientativo", choices: ["Da definire insieme", "Fino a 300 € al mese", "300–1.000 € al mese", "Oltre 1.000 € al mese"], def: "Da definire insieme", prefix: "budget " },
    ],
  },
  {
    id: "strategia", nome: "Strategia e report",
    desc: "Report sui risultati e confronto con noi per decidere i passi successivi.",
    opzioni: [
      { key: "formato", type: "single", label: "Formato", choices: ["Report mensile", "Report e call di 30 minuti", "Strategia e incontro di 1 ora"], def: "Report mensile" },
    ],
  },
];

(function () {
  const root = document.getElementById("soluzioni");
  if (!root) return;
  const STORE = "dieciplus-soluzione-v1"; // salva solo le scelte dei servizi, mai i dati personali
  const calm = window.matchMedia("(prefers-reduced-motion: reduce)");

  /* ---------------- Stato centralizzato ---------------- */
  const defaults = (s) => Object.fromEntries(s.opzioni.map((o) => [o.key, Array.isArray(o.def) ? [...o.def] : o.def]));
  const state = { path: "b", services: {} };
  CATALOGO_SERVIZI.forEach((s) => (state.services[s.id] = { on: false, ...defaults(s) }));
  try {
    const saved = JSON.parse(localStorage.getItem(STORE) || "null");
    if (saved && saved.services) {
      CATALOGO_SERVIZI.forEach((s) => {
        const v = saved.services[s.id];
        if (v) state.services[s.id] = { ...state.services[s.id], ...v };
      });
      if (saved.path === "a" || saved.path === "b") state.path = saved.path;
    }
  } catch (e) { /* archivio non disponibile: si riparte da zero */ }
  const save = () => { try { localStorage.setItem(STORE, JSON.stringify({ path: state.path, services: state.services })); } catch (e) {} };
  const selected = () => CATALOGO_SERVIZI.filter((s) => state.services[s.id].on);

  /* Riga di dettaglio di un servizio, usata nel riepilogo e nel messaggio */
  const detail = (s) => {
    const v = state.services[s.id], parts = [];
    s.opzioni.forEach((o) => {
      const x = v[o.key];
      if (o.type === "qty") parts.push(x + " " + o.unit);
      else if (o.type === "multi") parts.push(x.join(", "));
      else if (o.type === "single") parts.push((o.prefix || "") + x.charAt(0).toLowerCase() + x.slice(1));
      else if (o.type === "check" && x) parts.push(o.short);
    });
    return parts.filter(Boolean).join(" · ");
  };

  /* ---------------- Helper DOM ---------------- */
  const h = (tag, attrs = {}, ...kids) => {
    const el = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs)) {
      if (v === false || v == null) continue;
      if (k === "class") el.className = v;
      else if (k === "text") el.textContent = v;
      else if (k.startsWith("on")) el.addEventListener(k.slice(2), v);
      else el.setAttribute(k, v === true ? "" : v);
    }
    kids.flat().forEach((c) => c != null && el.append(c.nodeType ? c : document.createTextNode(c)));
    return el;
  };

  /* ---------------- Catalogo ---------------- */
  const catalog = root.querySelector("[data-catalogo]");
  const cards = {};
  const renderOption = (s, o) => {
    const id = `opt-${s.id}-${o.key}`;
    const v = () => state.services[s.id][o.key];
    if (o.type === "qty") {
      const out = h("output", { id, class: "qty-val", "aria-live": "polite" });
      const sync = () => {
        out.textContent = v();
        minus.disabled = v() <= o.min; plus.disabled = v() >= o.max;
      };
      const step = (d) => { const n = Math.min(o.max, Math.max(o.min, v() + d * o.step)); state.services[s.id][o.key] = n; sync(); update(); };
      const minus = h("button", { type: "button", class: "qty-btn", "aria-label": `Meno ${o.label.toLowerCase()}`, onclick: () => step(-1) }, "−");
      const plus = h("button", { type: "button", class: "qty-btn", "aria-label": `Più ${o.label.toLowerCase()}`, onclick: () => step(1) }, "+");
      const row = h("div", { class: "opt opt-qty" },
        h("span", { class: "opt-label", id: id + "-l" }, o.label),
        h("div", { class: "qty", role: "group", "aria-labelledby": id + "-l" }, minus, out, plus));
      sync();
      return row;
    }
    if (o.type === "multi" || o.type === "single") {
      const multi = o.type === "multi";
      const box = h("div", { class: "chips", role: multi ? "group" : "radiogroup", "aria-labelledby": id + "-l" });
      o.choices.forEach((c) => {
        const on = () => (multi ? v().includes(c) : v() === c);
        const b = h("button", { type: "button", class: "chip", role: multi ? null : "radio" }, c);
        const paint = () => { b.setAttribute(multi ? "aria-pressed" : "aria-checked", String(on())); };
        b.addEventListener("click", () => {
          if (multi) {
            const cur = v();
            if (cur.includes(c)) { if (cur.length > (o.min || 0)) state.services[s.id][o.key] = cur.filter((x) => x !== c); }
            else state.services[s.id][o.key] = o.choices.filter((x) => x === c || cur.includes(x));
          } else state.services[s.id][o.key] = c;
          box.querySelectorAll(".chip").forEach((x) => x._paint());
          update();
        });
        b._paint = paint; paint();
        box.append(b);
      });
      return h("div", { class: "opt opt-chips" }, h("span", { class: "opt-label", id: id + "-l" }, o.label), box);
    }
    if (o.type === "check") {
      const b = h("button", { type: "button", class: "switch", role: "switch", "aria-checked": String(!!v()) },
        h("span", { class: "switch-track", "aria-hidden": "true" }, h("span", { class: "switch-dot" })),
        h("span", { class: "switch-label" }, o.label));
      b.addEventListener("click", () => { state.services[s.id][o.key] = !v(); b.setAttribute("aria-checked", String(!!v())); update(); });
      return h("div", { class: "opt opt-check" }, b);
    }
  };

  const paintCard = (id) => {
    const on = state.services[id].on, c = cards[id];
    c.card.classList.toggle("on", on);
    c.toggle.setAttribute("aria-pressed", String(on));
    c.toggle.setAttribute("aria-label", (on ? "Rimuovi " : "Aggiungi ") + CATALOGO_SERVIZI.find((s) => s.id === id).nome);
    if (on) c.opts.removeAttribute("inert"); else c.opts.setAttribute("inert", "");
  };
  const setService = (id, on, user) => {
    state.services[id].on = on;
    if (on && user) state.path = "b";
    paintCard(id);
    update();
  };

  /* ---------------- Riepilogo live ---------------- */
  const stack = root.querySelector("[data-stack]");
  const count = root.querySelectorAll("[data-count]");
  const empty = root.querySelector("[data-empty]");
  const bar = root.querySelector("[data-bar]");
  const update = () => {
    const sel = selected();
    const prev = new Set([...stack.children].map((li) => li.dataset.id));
    stack.replaceChildren(...sel.map((s, i) => {
      const li = h("li", { class: "blk" + (prev.has(s.id) ? "" : " new"), "data-id": s.id },
        h("span", { class: "blk-n", "aria-hidden": "true" }, String(i + 1).padStart(2, "0")),
        h("span", { class: "blk-text" }, h("b", {}, s.nome), h("span", {}, detail(s))),
        h("button", { type: "button", class: "blk-x", "aria-label": "Rimuovi " + s.nome, onclick: () => setService(s.id, false, true) }, "×"));
      return li;
    }));
    const n = sel.length;
    count.forEach((c) => (c.textContent = n === 0 ? "Nessun servizio scelto" : n === 1 ? "1 servizio scelto" : n + " servizi scelti"));
    empty.hidden = n > 0;
    if (bar) bar.classList.toggle("has", n > 0);
    syncForm();
    save();
  };

  /* ---------------- Percorsi A / B ---------------- */
  const form = root.querySelector("#richiesta");
  const scrollTo = (el) => el.scrollIntoView({ behavior: calm.matches ? "auto" : "smooth", block: "start" });
  root.querySelectorAll("[data-path]").forEach((b) => b.addEventListener("click", () => {
    state.path = b.dataset.path;
    syncForm(); save();
    if (state.path === "a") { scrollTo(form); setTimeout(() => form.querySelector("[name=nome]").focus({ preventScroll: true }), calm.matches ? 0 : 600); }
    else { const t = root.querySelector("#costruisci"); scrollTo(t); setTimeout(() => cards[CATALOGO_SERVIZI[0].id].toggle.focus({ preventScroll: true }), calm.matches ? 0 : 600); }
  }));
  root.querySelectorAll("[data-to-form]").forEach((b) => b.addEventListener("click", () => {
    if (selected().length) state.path = "b";
    syncForm(); scrollTo(form);
    setTimeout(() => form.querySelector("[name=nome]").focus({ preventScroll: true }), calm.matches ? 0 : 600);
  }));
  root.querySelector("[data-reset]").addEventListener("click", () => {
    CATALOGO_SERVIZI.forEach((s) => { state.services[s.id] = { on: false, ...defaults(s) }; });
    stack.replaceChildren();
    catalog.replaceChildren(); Object.keys(cards).forEach((k) => delete cards[k]);
    CATALOGO_SERVIZI.forEach((s, i) => buildCard(s, i));
    update();
  });
  const buildCard = (s, i) => {
    const optsId = `svc-${s.id}-opzioni`;
    const toggle = h("button", { type: "button", class: "svc-toggle", "aria-pressed": "false", "aria-controls": optsId },
      h("span", { class: "svc-n", "aria-hidden": "true" }, String(i + 1).padStart(2, "0")),
      h("span", { class: "svc-text" }, h("b", { class: "svc-name" }, s.nome), h("span", { class: "svc-desc" }, s.desc)),
      h("span", { class: "svc-mark", "aria-hidden": "true" }));
    const opts = h("div", { class: "svc-opts", id: optsId }, h("div", { class: "svc-opts-in" }, s.opzioni.map((o) => renderOption(s, o))));
    const card = h("article", { class: "svc", "data-id": s.id }, toggle, opts);
    toggle.addEventListener("click", () => setService(s.id, !state.services[s.id].on, true));
    cards[s.id] = { card, toggle, opts };
    catalog.append(card);
    paintCard(s.id);
  };

  /* ---------------- Modulo di richiesta ---------------- */
  const radios = form.querySelectorAll("input[name=percorso]");
  const attach = form.querySelector("[data-attach]");
  const status = form.querySelector("[data-status]");
  function syncForm() {
    radios.forEach((r) => (r.checked = r.value === state.path));
    const n = selected().length;
    attach.textContent = state.path === "a"
      ? "Ci racconti la tua attività e ti proponiamo noi i servizi più adatti."
      : n ? `Alla richiesta alleghiamo la tua soluzione: ${n === 1 ? "1 servizio" : n + " servizi"}.`
          : "Non hai ancora scelto servizi: aggiungili qui sopra oppure scegli «Consigliatemi voi».";
  }
  radios.forEach((r) => r.addEventListener("change", () => { state.path = r.value; clearErr("percorso"); syncForm(); save(); }));

  const fields = {
    nome: (v) => v.trim().length >= 2 || "Scrivi il tuo nome.",
    attivita: (v) => v.trim().length >= 2 || "Scrivi il nome della tua attività.",
    contatto: (v) => {
      const t = v.trim();
      if (/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(t)) return true;
      if (/^\+?[\d\s().-]+$/.test(t) && t.replace(/\D/g, "").length >= 8) return true;
      return "Inserisci un'email valida o un numero di telefono.";
    },
    settore: (v) => !!v || "Scegli il settore della tua attività.",
    obiettivo: (v) => !!v || "Scegli l'obiettivo principale.",
  };
  const errEl = (name) => form.querySelector(`[data-err="${name}"]`);
  const setErr = (name, msg) => {
    const e = errEl(name); if (e) { e.textContent = msg; e.hidden = false; }
    const input = form.elements[name];
    if (input && input.setAttribute) input.setAttribute("aria-invalid", "true");
  };
  function clearErr(name) {
    const e = errEl(name); if (e) { e.textContent = ""; e.hidden = true; }
    const input = form.elements[name];
    if (input && input.removeAttribute) input.removeAttribute("aria-invalid");
  }
  Object.keys(fields).forEach((k) => form.elements[k].addEventListener("input", () => clearErr(k)));
  form.elements.consenso.addEventListener("change", () => clearErr("consenso"));

  const buildMessage = (d) => {
    const L = ["Ciao Dieci Più, vorrei una proposta per la mia attività.", "",
      "Nome: " + d.nome, "Attività: " + d.attivita, "Contatto: " + d.contatto,
      "Settore: " + d.settore, "Obiettivo: " + d.obiettivo, ""];
    if (state.path === "a") L.push("Percorso: consigliatemi voi i servizi più adatti.");
    else {
      L.push("La mia soluzione Dieci Più:");
      selected().forEach((s) => L.push("- " + s.nome + (detail(s) ? ": " + detail(s) : "")));
    }
    if (d.note) L.push("", "Note: " + d.note);
    return L.join("\n");
  };

  form.addEventListener("submit", (ev) => {
    ev.preventDefault();
    status.hidden = true; status.className = "form-status";
    let first = null;
    const d = {};
    Object.entries(fields).forEach(([k, check]) => {
      const val = form.elements[k].value; d[k] = val.trim();
      const ok = check(val);
      if (ok !== true) { setErr(k, ok); first = first || form.elements[k]; } else clearErr(k);
    });
    d.note = form.elements.note.value.trim();
    if (state.path === "b" && !selected().length) { setErr("percorso", "Scegli almeno un servizio oppure «Consigliatemi voi»."); first = first || radios[0]; }
    if (!form.elements.consenso.checked) { setErr("consenso", "Conferma di aver letto la Privacy Policy per inviare la richiesta."); first = first || form.elements.consenso; }
    if (first) { first.focus(); return; }

    const num = typeof CONFIG !== "undefined" && CONFIG.whatsapp ? String(CONFIG.whatsapp).replace(/\D/g, "") : "";
    if (!num) {
      status.textContent = "In questo momento non riusciamo ad aprire WhatsApp. Scrivici dai contatti in fondo alla pagina.";
      status.classList.add("err"); status.hidden = false; return;
    }
    const url = "https://wa.me/" + num + "?text=" + encodeURIComponent(buildMessage(d));
    const win = window.open(url, "_blank");
    if (win) win.opener = null;
    status.replaceChildren(
      h("b", {}, win ? "WhatsApp è aperto con la tua richiesta già scritta." : "Il browser non ha aperto WhatsApp."),
      " ",
      win ? "Premi invio per mandarcela: ti rispondiamo noi, non un centralino. " : "",
      h("a", { href: url, target: "_blank", rel: "noopener" }, win ? "Non si è aperto? Tocca qui." : "Apri WhatsApp e invia la richiesta"));
    status.classList.add(win ? "ok" : "warn");
    status.hidden = false;
    status.focus();
  });

  /* Primo disegno */
  CATALOGO_SERVIZI.forEach((s, i) => buildCard(s, i));
  update();
  root.classList.add("ready");
})();
