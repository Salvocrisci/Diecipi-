/* DIECI PIÙ — interazioni solo mobile (sotto i 768px).
   Tutto ciò che crea è marcato .m-only o agisce solo con mobile.css:
   su tablet e desktop la pagina resta quella di sempre. */
(function () {
  const mq = window.matchMedia("(max-width: 767.98px)");
  const calm = window.matchMedia("(prefers-reduced-motion: reduce)");
  const io = (cb, opts) => ("IntersectionObserver" in window ? new IntersectionObserver(cb, opts) : null);

  /* ---------- Risultati: il numero di ogni cliente sale quando entra nello schermo ---------- */
  const stats = [...document.querySelectorAll("#clienti .voice-stat b")];
  const countUp = (el) => {
    const final = el.textContent.trim();
    const m = final.match(/^(\D*)([\d.]+)(\D*)$/);
    if (!m || calm.matches || !mq.matches) return;
    const target = parseInt(m[2].replace(/\./g, ""), 10);
    const fmt = (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    const t0 = performance.now(), dur = target > 100 ? 1400 : 900;
    el.setAttribute("aria-label", final);
    const step = (t) => {
      const p = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - p, 3);
      el.textContent = m[1] + fmt(Math.max(1, Math.round(target * e))) + m[3];
      if (p < 1) requestAnimationFrame(step); else { el.textContent = final; el.removeAttribute("aria-label"); }
    };
    requestAnimationFrame(step);
  };
  const so = io((entries) => {
    entries.forEach((e) => { if (e.isIntersecting) { countUp(e.target); so.unobserve(e.target); } });
  }, { threshold: 0.6 });
  if (so) stats.forEach((b) => so.observe(b));

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
    const speed = [-0.08, -0.16, -0.04, -0.12];
    const base = ["rotate(-8deg)", "none", "rotate(8deg)", "rotate(3deg)"];
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
