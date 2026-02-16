// header-loader.js
// Shared header loader + active nav
// + Safari desktop FIX: portal dropdown "Tecniche" in <body> (solo Safari desktop)
// + iOS Safari FIX: toggle robusto per mobile <details class="menu"> (solo iOS Safari)

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

  function isSafariDesktop() {
    const ua = navigator.userAgent;
    // Safari desktop: contiene "Safari" ma NON Chrome/Edge/Firefox/Android
    return /safari/i.test(ua) && !/chrome|crios|android|edg|fxios|firefox/i.test(ua);
  }

  function isIOSSafari() {
    const ua = navigator.userAgent;
    const isIOS = /iphone|ipad|ipod/i.test(ua);
    const isWebKit = /webkit/i.test(ua);
    const notOther = !/crios|fxios|edg/i.test(ua);
    return isIOS && isWebKit && notOther;
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
        desktopDetails.open = false; // desktop: NON aperto di default
      }

      const mobileDetails = container.querySelector('.mobile-nav details[data-nav="tecniche"]');
      if (mobileDetails) mobileDetails.open = true; // mobile: ok aperto (se vuoi)
    }
  }

  // Chiudi dropdown desktop quando clicchi una voce (prima del reload)
  function initDesktopSubmenuCloseOnClick(container) {
    const details = container.querySelector('.desktop-nav details.submenu[data-nav="tecniche"]');
    if (!details) return;

    details.querySelectorAll('.submenu-links a').forEach((a) => {
      a.addEventListener("click", () => {
        details.open = false;
      });
    });
  }

  // ✅ iOS Safari ONLY: toggle manuale menu mobile (su altri browser lasciamo nativo)
  function initMobileMenuFix(container) {
    const menu = container.querySelector("details.menu.mobile-nav");
    if (!menu) return;

    // Browser normali: lascia nativo
    if (!isIOSSafari()) {
      menu.querySelectorAll("a").forEach((a) => {
        a.addEventListener("click", () => (menu.open = false));
      });
      return;
    }

    const summary = menu.querySelector("summary");
    if (!summary) return;

    const toggle = (e) => {
      e.preventDefault();
      e.stopPropagation();
      menu.open = !menu.open;
    };

    summary.addEventListener("touchend", toggle, { passive: false });
    summary.addEventListener("click", toggle, { passive: false });

    menu.querySelectorAll("a").forEach((a) => {
      a.addEventListener("click", () => (menu.open = false));
      a.addEventListener("touchend", () => (menu.open = false), { passive: true });
    });

    document.addEventListener(
      "touchstart",
      (e) => {
        if (!menu.open) return;
        if (menu.contains(e.target)) return;
        menu.open = false;
      },
      { passive: true }
    );

    document.addEventListener(
      "click",
      (e) => {
        if (!menu.open) return;
        if (menu.contains(e.target)) return;
        menu.open = false;
      },
      { passive: true }
    );
  }

  // ✅ Safari desktop: portal dropdown "Tecniche" in <body> + click sempre cliccabile
  function initSafariDropdownPortal(container) {
    if (!isSafariDesktop()) return;

    const details = container.querySelector('.desktop-nav details.submenu[data-nav="tecniche"]');
    if (!details) return;

    const summary = details.querySelector("summary");
    const menu = details.querySelector(".submenu-links");
    if (!summary || !menu) return;

    const placeholder = document.createComment("submenu-links-placeholder");
    let portaled = false;

    function place() {
      if (!details.open || !portaled) return;

      const r = summary.getBoundingClientRect();
      const top = Math.round(r.bottom + 8);
      let left = Math.round(r.left);

      menu.style.position = "fixed";
      menu.style.top = `${top}px`;
      menu.style.left = `${left}px`;
      menu.style.right = "auto";
      menu.style.zIndex = "2147483647";
      menu.style.pointerEvents = "auto";
      menu.style.transform = "translateZ(0)";

      // rientra a destra se sfora
      const rect = menu.getBoundingClientRect();
      const maxRight = window.innerWidth - 10;
      if (rect.right > maxRight) {
        left = Math.max(10, left - (rect.right - maxRight));
        menu.style.left = `${left}px`;
      }

      // se sfora in basso, prova sopra
      const rect2 = menu.getBoundingClientRect();
      const maxBottom = window.innerHeight - 10;
      if (rect2.bottom > maxBottom) {
        const aboveTop = Math.max(10, Math.round(r.top - 8 - rect2.height));
        menu.style.top = `${aboveTop}px`;
      }
    }

    function portalIn() {
      if (portaled) return;
      details.insertBefore(placeholder, menu);
      document.body.appendChild(menu);
      menu.classList.add("is-portaled");
      portaled = true;
      place();
    }

    function portalOut() {
      if (!portaled) return;

      menu.classList.remove("is-portaled");
      menu.style.position = "";
      menu.style.top = "";
      menu.style.left = "";
      menu.style.right = "";
      menu.style.zIndex = "";
      menu.style.pointerEvents = "";
      menu.style.transform = "";

      if (placeholder.parentNode) {
        placeholder.parentNode.insertBefore(menu, placeholder);
        placeholder.parentNode.removeChild(placeholder);
      }
      portaled = false;
    }

    details.addEventListener("toggle", () => {
      if (details.open) portalIn();
      else portalOut();
    });

    window.addEventListener("scroll", place, { passive: true });
    window.addEventListener("resize", place, { passive: true });

    // 🔥 fondamentale: NON chiudere prima che il click sul link venga processato
    document.addEventListener("pointerdown", (e) => {
      if (!details.open) return;
      const insideSummary = summary.contains(e.target);
      const insideMenu = menu.contains(e.target);
      if (!insideSummary && !insideMenu) details.open = false;
    });

    // stop propagation dentro menu (evita chiusure aggressive)
    menu.addEventListener("pointerdown", (e) => e.stopPropagation());
  }

  async function loadHeader() {
    const host = document.getElementById(HOST_ID);
    if (!host) return;

    try {
      const res = await fetch(`${HEADER_URL}?v=${VERSION}`, { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status} loading ${HEADER_URL}`);

      host.innerHTML = await res.text();

      setActiveNav(host);
      initDesktopSubmenuCloseOnClick(host);
      initMobileMenuFix(host);
      initSafariDropdownPortal(host);

      window.addEventListener("popstate", () => setActiveNav(host));
    } catch (err) {
      console.error("Header load failed:", err);
    }
  }

  document.addEventListener("DOMContentLoaded", loadHeader);
})();
