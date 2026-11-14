/* DIECI+ — interazioni solo mobile (sotto i 768px).
   Tutto ciò che crea è marcato .m-only o agisce solo con mobile.css:
   su tablet e desktop la pagina resta quella di sempre. */
(function () {
  const mq = window.matchMedia("(max-width: 767.98px)");
  const calm = window.matchMedia("(prefers-reduced-motion: reduce)");
  const io = (cb, opts) => ("IntersectionObserver" in window ? new IntersectionObserver(cb, opts) : null);

  /* ---------- Risultati: numeri presi dalle testimonianze esistenti ---------- */
  const clienti = document.getElementById("clienti");
  const list = clienti && clienti.querySelector(".voices-list");
  const results = [];
  if (list) {
    list.querySelectorAll(".voice-feature").forEach((f) => {
      const stat = f.querySelector(".voice-stat");
      if (!stat) return;
      const big = stat.querySelector("b").textContent.trim();
      const text = stat.querySelector("span").innerHTML;
      const who = f.querySelector(".voice-who b");
      const role = f.querySelector(".voice-who div span");
      const sector = f.querySelector("figcaption > .label");
      results.push({ big, text, who: who ? who.textContent : "", role: role ? role.textContent : "", sector: sector ? sector.textContent : "" });
    });
  }
  if (results.length) {
    const wrap = document.createElement("div");
    wrap.className = "m-only m-results";
    wrap.setAttribute("aria-label", "Risultati dei clienti");
    results.forEach((r) => {
      const card = document.createElement("article");
      card.className = "m-result";
      card.innerHTML =
        '<span class="label"></span>' +
        '<div class="m-big" aria-hidden="true"></div>' +
        '<p class="sr-only"></p>' +
        '<p class="m-text" aria-hidden="true"></p>' +
        '<span class="m-src"></span>';
      card.querySelector(".label").textContent = "Risultato · " + r.sector;
      card.querySelector(".m-big").textContent = r.big;
      card.querySelector(".m-big").dataset.final = r.big;
      card.querySelector(".m-text").innerHTML = r.text;
      card.querySelector(".sr-only").textContent = r.big + " " + card.querySelector(".m-text").textContent;
      card.querySelector(".m-src").textContent = "Fonte: " + r.who + (r.role ? ", " + r.role : "") + " · video qui sotto";
      wrap.appendChild(card);
    });
    list.parentNode.insertBefore(wrap, list);
    document.documentElement.classList.add("has-mresults");

    // Numeri che salgono, una volta sola, quando entrano nello schermo
    const countUp = (el) => {
      const final = el.dataset.final;
      const m = final.match(/^(\D*)([\d.]+)(\D*)$/);
      if (!m || calm.matches) return;
      const target = parseInt(m[2].replace(/\./g, ""), 10);
      const fmt = (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
      const t0 = performance.now(), dur = target > 100 ? 1400 : 900;
      const step = (t) => {
        const p = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - p, 3);
        el.textContent = m[1] + fmt(Math.max(1, Math.round(target * e))) + m[3];
        if (p < 1) requestAnimationFrame(step); else el.textContent = final;
      };
      requestAnimationFrame(step);
    };
    const ro = io((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        e.target.classList.add("in");
        if (mq.matches) countUp(e.target.querySelector(".m-big"));
        ro.unobserve(e.target);
      });
    }, { threshold: 0.35 });
    wrap.querySelectorAll(".m-result").forEach((c) => (ro ? ro.observe(c) : c.classList.add("in")));
  }

  /* ---------- Lavori: carosello con un progetto protagonista ---------- */
  const work = document.querySelector(".m-work");
  if (work) {
    const track = work.querySelector(".m-slides");
    const slides = [...track.querySelectorAll(".m-slide")];
    const counter = work.querySelector(".m-count b");
    let active = 0, visible = false;
    const sync = () => {
      slides.forEach((s, i) => {
        const v = s.querySelector("video");
        const on = i === active;
        s.classList.toggle("active", on);
        if (on && visible && mq.matches && !calm.matches) {
          if (v.preload !== "auto") v.preload = "auto";
          const p = v.play(); if (p && p.catch) p.catch(() => {});
        } else if (!v.paused) v.pause();
      });
      if (counter) counter.textContent = String(active + 1).padStart(2, "0");
    };
    let raf = 0;
    track.addEventListener("scroll", () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const w = slides[0].getBoundingClientRect().width + 14;
        const i = Math.max(0, Math.min(slides.length - 1, Math.round(track.scrollLeft / w)));
        if (i !== active) { active = i; sync(); }
      });
    }, { passive: true });
    const wo = io((entries) => { visible = entries[0].isIntersecting; sync(); }, { threshold: 0.35 });
    if (wo) wo.observe(track);
    sync();
  }

  /* ---------- Pacchetti: schede, dettagli espandibili, indicatori ---------- */
  const plansBox = document.querySelector(".plans");
  if (plansBox) {
    const plans = [...plansBox.querySelectorAll(".plan")];
    const tabs = document.createElement("div");
    tabs.className = "m-only m-tabs";
    tabs.setAttribute("role", "group");
    tabs.setAttribute("aria-label", "Scegli il pacchetto");
    const dots = document.createElement("div");
    dots.className = "m-only m-plan-dots";
    dots.setAttribute("aria-hidden", "true");
    plans.forEach((p, i) => {
      const name = p.querySelector(".plan-name").textContent.trim();
      const price = p.querySelector(".price b").textContent.trim();
      p.id = p.id || "piano-" + name.toLowerCase();
      const b = document.createElement("button");
      b.type = "button";
      b.setAttribute("aria-controls", p.id);
      b.innerHTML = "<span></span><small></small>";
      b.querySelector("span").textContent = name;
      b.querySelector("small").textContent = price + " / mese";
      b.addEventListener("click", () => go(i, true));
      tabs.appendChild(b);
      dots.appendChild(document.createElement("span"));

      // Dettagli: prime 4 voci visibili, il resto su richiesta (solo mobile.css nasconde)
      const items = p.querySelectorAll("ul li");
      if (items.length > 4) {
        p.classList.add("m-collapsed");
        const more = document.createElement("button");
        more.type = "button";
        more.className = "m-only m-more";
        more.setAttribute("aria-expanded", "false");
        const label = () => (p.classList.contains("m-collapsed") ? "Tutti i dettagli · " + items.length + " voci" : "Mostra meno");
        more.textContent = label();
        more.addEventListener("click", () => {
          p.classList.toggle("m-collapsed");
          more.setAttribute("aria-expanded", String(!p.classList.contains("m-collapsed")));
          more.textContent = label();
        });
        p.querySelector("ul").after(more);
      }
    });
    plansBox.before(tabs);
    plansBox.after(dots);
    let current = -1;
    const mark = (i) => {
      if (i === current) return;
      current = i;
      [...tabs.children].forEach((b, j) => {
        b.setAttribute("aria-current", String(j === i));
      });
      [...dots.children].forEach((d, j) => d.classList.toggle("on", j === i));
    };
    const go = (i, smooth) => {
      const left = plans[i].offsetLeft - plansBox.offsetLeft - 20;
      plansBox.scrollTo({ left, behavior: smooth && !calm.matches ? "smooth" : "auto" });
      mark(i);
    };
    let r2 = 0;
    plansBox.addEventListener("scroll", () => {
      cancelAnimationFrame(r2);
      r2 = requestAnimationFrame(() => {
        const w = plans[0].getBoundingClientRect().width + 12;
        mark(Math.max(0, Math.min(plans.length - 1, Math.round(plansBox.scrollLeft / w))));
      });
    }, { passive: true });
    const featured = Math.max(0, plans.findIndex((p) => p.classList.contains("featured")));
    const start = () => { if (mq.matches) go(featured, false); else mark(featured); };
    start();
    mq.addEventListener ? mq.addEventListener("change", start) : mq.addListener(start);
  }

  /* ---------- Barra in basso: compare dopo l'hero, comanda il menu ---------- */
  const dock = document.querySelector(".m-dock");
  const nav = document.getElementById("nav");
  const toggle = nav && nav.querySelector(".nav-toggle");
  if (dock && toggle) {
    const btn = dock.querySelector(".m-dock-menu");
    const lbl = dock.querySelector(".m-dock-label");
    btn.addEventListener("click", () => toggle.click());
    new MutationObserver(() => {
      const open = nav.classList.contains("open");
      btn.setAttribute("aria-expanded", String(open));
      lbl.textContent = open ? "Chiudi" : "Menu";
    }).observe(nav, { attributes: true, attributeFilter: ["class"] });
    const cta = document.querySelector(".hero-cta");
    const d = io((entries) => dock.classList.toggle("show", !entries[0].isIntersecting && entries[0].boundingClientRect.top < 0), { threshold: 0 });
    if (d && cta) d.observe(cta); else dock.classList.add("show");
  }

  /* ---------- Parallasse leggera sui reel dell'hero ---------- */
  const stage = document.querySelector(".reel-stack");
  if (stage && !calm.matches) {
    const reels = [...stage.querySelectorAll(".reel")];
    const speed = [-0.08, -0.16, -0.04];
    const base = ["rotate(-7deg)", "none", "rotate(7deg)"];
    let ticking = false;
    const paint = () => {
      ticking = false;
      if (!mq.matches) { reels.forEach((r) => (r.style.transform = "")); return; }
      const y = window.scrollY;
      if (y > window.innerHeight * 1.5) return;
      reels.forEach((r, i) => {
        r.style.transform = "translate3d(0," + (y * speed[i]).toFixed(1) + "px,0) " + (base[i] === "none" ? "" : base[i]);
      });
    };
    window.addEventListener("scroll", () => { if (!ticking) { ticking = true; requestAnimationFrame(paint); } }, { passive: true });
    mq.addEventListener ? mq.addEventListener("change", paint) : mq.addListener(paint);
  }
})();
