// header-loader.js
// Shared header loader + active nav
// Robust <details> toggling across browsers (esp. iOS WebKit: Safari/Chrome/Firefox/DuckDuckGo/Edge)

(function () {
  const HOST_ID = "site-header";
  const HEADER_URL = "/header.html";
  const VERSION = "20260303"; // cambia per bustare cache

  function normalizePath(pathname) {
    let p = (pathname || "/").toLowerCase();
    p = p.split("?")[0].split("#")[0];
    if (p === "/index" || p === "/index.html") p = "/";
    p = p.replace(/\.html$/i, "");
    if (p.length > 1 && p.endsWith("/")) p = p.slice(0, -1);
    return p;
  }

  // iOS WebKit = tutti i browser su iPhone/iPad (Safari + Chrome + Firefox + DuckDuckGo + Edge ecc.)
  function isIOSWebKit() {
    const ua = navigator.userAgent || "";
    const isIOS = /iphone|ipad|ipod/i.test(ua);
    const isWebKit = /webkit/i.test(ua);
    return isIOS && isWebKit;
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

    const key = activeLink ? activeLink.getAttribute("data-nav") : null;
    const isTechnique = ["surfcasting", "beach-ledgering", "spinning"].includes(key);

    if (isTechnique) {
      const desktopDetails = container.querySelector('details.submenu[data-nav="tecniche"]');
      if (desktopDetails) {
        desktopDetails.classList.add("is-active");
        desktopDetails.open = false; // desktop: NON aperto di default
      }

      const mobileDetails = container.querySelector('.mobile-nav details[data-nav="tecniche"]');
      if (mobileDetails) mobileDetails.open = true; // mobile: ok aperto (se ti piace)
    }
  }

  // Utility: close <details> when clicking outside
  function closeOnOutsideClick(detailsEl, whitelistEls = []) {
    function handler(e) {
      if (!detailsEl.open) return;
      const target = e.target;
      if (detailsEl.contains(target)) return;
      for (const el of whitelistEls) {
        if (el && el.contains && el.contains(target)) return;
      }
      detailsEl.open = false;
    }
    // capture per evitare “race conditions”
    document.addEventListener("pointerdown", handler, true);
    document.addEventListener("touchstart", handler, { passive: true, capture: true });
  }

  // Desktop: chiudi dropdown tecniche quando clicchi una voce + fuori
  function initDesktopDropdown(container) {
    const details = container.querySelector('.desktop-nav details.submenu[data-nav="tecniche"]');
    if (!details) return;

    // chiudi quando clicchi un link nel dropdown
    details.querySelectorAll(".submenu-links a").forEach((a) => {
      a.addEventListener("click", () => {
        details.open = false;
      });
    });

    // chiudi cliccando fuori
    closeOnOutsideClick(details);
  }

  // Mobile: gestione robusta del <details class="menu mobile-nav">
  function initMobileMenu(container) {
    const menu = container.querySelector("details.menu.mobile-nav");
    if (!menu) return;

    const summary = menu.querySelector("summary");
    const panel = menu.querySelector(".menu-panel");

    // Sempre: chiudi quando clicchi un link
    menu.querySelectorAll("a").forEach((a) => {
      a.addEventListener("click", () => (menu.open = false));
    });

    // Chiudi cliccando fuori
    closeOnOutsideClick(menu);

    // Evita che il click dentro il pannello venga interpretato come “fuori”
    if (panel) {
      panel.addEventListener("pointerdown", (e) => e.stopPropagation(), true);
      panel.addEventListener("click", (e) => e.stopPropagation(), true);
      panel.addEventListener("touchstart", (e) => e.stopPropagation(), { passive: true, capture: true });
    }

    // Su iOS WebKit, NON fidarti del toggle nativo di <details>
    // → intercettiamo il tap sul summary e toggliamo noi
    if (isIOSWebKit() && summary) {
      const toggle = (e) => {
        // blocca il comportamento nativo (che su iOS WebKit è spesso buggato/incoerente)
        e.preventDefault();
        e.stopPropagation();
        menu.open = !menu.open;
      };

      summary.addEventListener("pointerup", toggle, { passive: false });
      summary.addEventListener("click", toggle, { passive: false });
      summary.addEventListener("touchend", toggle, { passive: false });
    }
  }

  // Mobile: submenu “Tecniche” dentro il pannello (opzionale ma aiuta)
  // Chiude gli altri submenu quando ne apri uno (mantiene ordine)
  function initMobileSubmenu(container) {
    const mobileMenu = container.querySelector("details.menu.mobile-nav");
    if (!mobileMenu) return;

    const submenus = Array.from(mobileMenu.querySelectorAll('details[data-nav="tecniche"]'));
    if (!submenus.length) return;

    submenus.forEach((d) => {
      d.addEventListener("toggle", () => {
        if (!d.open) return;
        submenus.forEach((other) => {
          if (other !== d) other.open = false;
        });
      });
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
      initMobileSubmenu(host);

      window.addEventListener("popstate", () => setActiveNav(host));
    } catch (err) {
      console.error("Header load failed:", err);
    }
  }

  document.addEventListener("DOMContentLoaded", loadHeader);
})();
