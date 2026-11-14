/* DIECI+ — interazioni */

// ---- Da compilare: contatti reali ----
const CONFIG = {
  whatsapp: "447341696646",  // +44 7341 696646 (prefisso internazionale, solo cifre)
  messaggio: "Ciao DIECI+, vorrei informazioni per la mia attività.",
  instagram: "https://www.instagram.com/dieci_piu_/",
  tiktok: "https://www.tiktok.com/@dieci_piu"
};

(function () {
  // Link WhatsApp
  if (CONFIG.whatsapp) {
    document.querySelectorAll("[data-wa]").forEach((a) => {
      const msg = a.getAttribute("data-msg") || CONFIG.messaggio;
      a.href = "https://wa.me/" + CONFIG.whatsapp + "?text=" + encodeURIComponent(msg);
      a.target = "_blank";
      a.rel = "noopener";
    });
  }
  // Social
  document.querySelectorAll("[data-social]").forEach((a) => {
    const url = CONFIG[a.getAttribute("data-social")];
    if (url) a.href = url; else a.closest("li").hidden = true;
  });
  const y = document.querySelector("[data-year]");
  if (y) y.textContent = new Date().getFullYear();

  // Navbar: stato allo scroll + WhatsApp fisso
  const nav = document.getElementById("nav");
  const wa = document.querySelector(".wa-float");
  const onScroll = () => {
    const s = window.scrollY;
    nav.classList.toggle("scrolled", s > 12);
    wa.classList.toggle("show", s > window.innerHeight * 0.6);
    wa.classList.toggle("on-dark", footer.getBoundingClientRect().top < window.innerHeight - 40);
  };
  const footer = document.querySelector(".footer");
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  // Menu mobile
  const toggle = nav.querySelector(".nav-toggle");
  const menu = document.getElementById("menu");
  const setMenu = (open) => {
    nav.classList.toggle("open", open);
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Chiudi il menu" : "Apri il menu");
    document.body.style.overflow = open ? "hidden" : "";
  };
  toggle.addEventListener("click", () => setMenu(!nav.classList.contains("open")));
  menu.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => setMenu(false)));
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") setMenu(false); });

  // Video testimonianze: parte con l'audio solo al click
  document.querySelectorAll("[data-play]").forEach((b) => {
    b.addEventListener("click", () => {
      const v = document.getElementById(b.dataset.play);
      const box = b.closest(".reel");
      document.querySelectorAll("video").forEach((o) => { if (o !== v) o.pause(); });
      b.hidden = true;
      const d = box.querySelector(".dur"); if (d) d.hidden = true;
      box.classList.add("playing");
      v.controls = true;
      const p = v.play(); if (p && p.catch) p.catch(() => {});
    });
  });

  // Ingressi
  const hero = document.querySelector(".hero");
  requestAnimationFrame(() => requestAnimationFrame(() => hero.classList.add("in")));

  if (!("IntersectionObserver" in window)) {
    document.querySelectorAll("[data-reveal],[data-process]").forEach((el) => el.classList.add("in"));
    return;
  }
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
    });
  }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
  document.querySelectorAll("[data-reveal],[data-process]").forEach((el) => {
    if (!el.closest(".hero")) io.observe(el);
  });
  hero.querySelectorAll("[data-reveal]").forEach((el) => setTimeout(() => el.classList.add("in"), 50));

  // Voce attiva nella navbar
  const links = [...document.querySelectorAll(".nav-links a")];
  const map = Object.fromEntries(links.map((a) => [a.getAttribute("href").slice(1), a]));
  const spy = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      links.forEach((a) => a.classList.remove("on"));
      if (map[e.target.id]) map[e.target.id].classList.add("on");
    });
  }, { rootMargin: "-40% 0px -55% 0px" });
  document.querySelectorAll("main section[id]").forEach((s) => spy.observe(s));
})();
