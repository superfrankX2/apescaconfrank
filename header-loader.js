// header-loader.js
// Shared header loader + active nav
// Mobile menu: manual toggle ALWAYS (cross-device, cross-browser)

(function () {
  const HOST_ID = "site-header";
  const HEADER_URL = "/header.html";
  const VERSION = "20260305"; // cambia per bustare cache

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

    // Evidenzia "Tecniche" se siamo in una pagina tecnica
    const key = activeLink ? activeLink.getAttribute("data-nav") : null;
    const isTechnique = ["surfcasting", "beach-ledgering", "spinning"].includes(key);

    if (isTechnique) {
      const desktopDetails = container.querySelector('details.submenu[data-nav="tecniche"]');
      if (desktopDetails) {
        desktopDetails.classList.add("is-active");
        desktopDetails.open = false;
      }

      const mobileDetails = container.querySelector('.mobile-nav details[data-nav="tecniche"]');
      if (mobileDetails) mobileDetails.open = true;
    }
  }

  // Chiudi un <details> cliccando/toccando fuori (robusto)
  function closeOnOutside(detailsEl, extraInsideEls = []) {
    function isInside(target) {
      if (detailsEl.contains(target)) return true;
      for (const el of extraInsideEls) {
        if (el && el.contains && el.contains(target)) return true;
      }
      return false;
    }

    function handler(e) {
      if (!detailsEl.open) return;
      if (isInside(e.target)) return;
      detailsEl.open = false;
    }

    // pointerdown in capture = il più affidabile
    document.addEventListener("pointerdown", handler, true);
    document.addEventListener("touchstart", handler, { passive: true, capture: true });
  }

  // Desktop dropdown "Tecniche": chiudi su click link + fuori
  function initDesktopDropdown(container) {
    const details = container.querySelector('.desktop-nav details.submenu[data-nav="tecniche"]');
    if (!details) return;

    details.querySelectorAll(".submenu-links a").forEach((a) => {
      a.addEventListener("click", () => (details.open = false));
    });

    closeOnOutside(details);
  }

  // ⭐ Mobile menu: toggle manuale SEMPRE (tutti i browser, tutti i device)
  function initMobileMenu(container) {
    const menu = container.querySelector("details.menu.mobile-nav");
    if (!menu) return;

    const summary = menu.querySelector("summary");
    const panel = menu.querySelector(".menu-panel");
    if (!summary) return;

    // Anti doppio evento (pointer + click): evita “apre/chiude subito”
    let lastToggleAt = 0;
    function safeToggle(e) {
      // blocca completamente il comportamento nativo di <details>
      e.preventDefault();
      e.stopPropagation();

      const now = Date.now();
      if (now - lastToggleAt < 350) return; // ignora doppioni ravvicinati
      lastToggleAt = now;

      menu.open = !menu.open;
    }

    // IMPORTANTISSIMO: usare pointerdown (il più consistente su mobile)
    summary.addEventListener("pointerdown", safeToggle, { passive: false });
    summary.addEventListener("click", safeToggle, { passive: false });
    summary.addEventListener("touchend", safeToggle, { passive: false });

    // click dentro panel non deve propagare
    if (panel) {
      panel.addEventListener("pointerdown", (e) => e.stopPropagation(), true);
      panel.addEventListener("click", (e) => e.stopPropagation(), true);
      panel.addEventListener("touchstart", (e) => e.stopPropagation(), { passive: true, capture: true });
    }

    // chiudi quando clicchi un link (prima del cambio pagina)
    menu.querySelectorAll("a").forEach((a) => {
      a.addEventListener("click", () => (menu.open = false));
      a.addEventListener("pointerdown", () => (menu.open = false), { passive: true });
      a.addEventListener("touchstart", () => (menu.open = false), { passive: true });
    });

    // chiudi cliccando fuori
    closeOnOutside(menu, panel ? [panel] : []);
  }

  // Mobile submenu "Tecniche": se apri uno, chiudi gli altri (ordine pulito)
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
