// header-loader.js
// Carica header.html dentro #site-header + evidenzia voce attiva + menu dropdown Safari-safe

(function () {
  const HOST_ID = "site-header";
  const HEADER_URL = "/header.html";
  const VERSION = "20260216";

  function normalizePath(pathname) {
    let p = (pathname || "/").toLowerCase();
    p = p.split("?")[0].split("#")[0];
    if (p === "/index" || p === "/index.html") p = "/";
    p = p.replace(/\.html$/i, "");
    if (p.length > 1 && p.endsWith("/")) p = p.slice(0, -1);
    return p;
  }

  function setActiveNav(container) {
    const current = normalizePath(window.location.pathname);

    container.querySelectorAll(".is-active").forEach((el) => el.classList.remove("is-active"));

    const navLinks = Array.from(container.querySelectorAll('a[data-nav]:not(.cta)'));
    let activeLink = null;

    for (const link of navLinks) {
      const href = link.getAttribute("href");
      if (!href) continue;
      const linkPath = normalizePath(new URL(href, window.location.origin).pathname);
      if (linkPath === current) {
        activeLink = link;
        break;
      }
    }

    if (!activeLink) {
      const last = current.split("/").pop() || "";
      activeLink = container.querySelector(`[data-nav="${last}"]`);
    }

    if (activeLink) activeLink.classList.add("is-active");

    // Tecniche: se sono su una tecnica, evidenzio anche il parent + apro i menu (desktop+mobile)
    const key = activeLink ? activeLink.getAttribute("data-nav") : null;
    const isTechnique = ["surfcasting", "beach-ledgering", "spinning"].includes(key);

    if (isTechnique) {
      const desktopWrap = container.querySelector('.nav-dropdown[data-nav="tecniche"]');
      if (desktopWrap) desktopWrap.classList.add("is-active");

      const mobileSub = container.querySelector(".mobile-submenu");
      if (mobileSub) mobileSub.classList.add("is-open");
    }
  }

  function initDesktopDropdown(container) {
    const wrap = container.querySelector('.nav-dropdown[data-nav="tecniche"]');
    if (!wrap) return;

    const btn = wrap.querySelector(".nav-dropdown__toggle");
    const menu = wrap.querySelector(".nav-dropdown__menu");
    if (!btn || !menu) return;

    function open() {
      wrap.classList.add("is-open");
      btn.setAttribute("aria-expanded", "true");
    }
    function close() {
      wrap.classList.remove("is-open");
      btn.setAttribute("aria-expanded", "false");
    }
    function toggle() {
      if (wrap.classList.contains("is-open")) close();
      else open();
    }

    // Click toggle (Safari-safe)
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      toggle();
    });

    // Chiudi cliccando fuori
    document.addEventListener("click", (e) => {
      if (!wrap.contains(e.target)) close();
    });

    // Chiudi su ESC
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") close();
    });

    // Apri anche su hover/focus (desktop)
    wrap.addEventListener("mouseenter", open);
    wrap.addEventListener("mouseleave", close);
  }

  function initMobileMenu(container) {
    const btn = container.querySelector(".mobile-menu-btn");
    const panel = container.querySelector("#mobileMenuPanel");
    if (!btn || !panel) return;

    const subBtn = panel.querySelector(".mobile-submenu__toggle");
    const subWrap = panel.querySelector(".mobile-submenu");

    function openPanel() {
      panel.hidden = false;
      btn.setAttribute("aria-expanded", "true");
    }
    function closePanel() {
      panel.hidden = true;
      btn.setAttribute("aria-expanded", "false");
      // richiudo anche il submenu
      if (subWrap) subWrap.classList.remove("is-open");
      if (subBtn) subBtn.setAttribute("aria-expanded", "false");
    }
    function togglePanel() {
      if (panel.hidden) openPanel();
      else closePanel();
    }

    // iOS Safari: touchstart è più affidabile del click su elementi “in overlay”
    const toggleEvt = (e) => {
      e.preventDefault();
      e.stopPropagation();
      togglePanel();
    };

    btn.addEventListener("touchstart", toggleEvt, { passive: false });
    btn.addEventListener("click", toggleEvt);

    // Submenu tecniche
    if (subBtn && subWrap) {
      const toggleSub = (e) => {
        e.preventDefault();
        e.stopPropagation();
        const isOpen = subWrap.classList.toggle("is-open");
        subBtn.setAttribute("aria-expanded", isOpen ? "true" : "false");
      };
      subBtn.addEventListener("touchstart", toggleSub, { passive: false });
      subBtn.addEventListener("click", toggleSub);
    }

    // Chiudi quando clicchi un link
    panel.querySelectorAll("a").forEach((a) => {
      a.addEventListener("click", () => closePanel());
    });

    // Chiudi cliccando fuori
    document.addEventListener("click", (e) => {
      if (panel.hidden) return;
      if (!panel.contains(e.target) && e.target !== btn) closePanel();
    });

    // Chiudi su ESC
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closePanel();
    });
  }

  async function loadHeader() {
    const host = document.getElementById(HOST_ID);
    if (!host) return;

    try {
      const res = await fetch(`${HEADER_URL}?v=${VERSION}`, { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status} loading ${HEADER_URL}`);

      host.innerHTML = await res.text();

      setActiveNav(host);
      initDesktopDropdown(host);
      initMobileMenu(host);
    } catch (err) {
      console.error("Header load failed:", err);
    }
  }

  document.addEventListener("DOMContentLoaded", loadHeader);
})();
