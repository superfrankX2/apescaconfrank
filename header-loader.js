// header-loader.js
// Header shared loader + active nav
// + Universal FIX: dropdown "Tecniche" portaled to <body> (click sempre ok su tutti i browser)
// + iOS FIX: robust toggle for mobile <details class="menu">

(function () {
  const HOST_ID = "site-header";
  const HEADER_URL = "/header.html";
  const VERSION = "20260301"; // cambia per bustare cache

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

    // Evidenzia "Tecniche" se siamo in una pagina tecnica (ma non lasciarlo aperto su desktop)
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

  // Mobile iOS: toggle robusto per il <details class="menu">
  function initMobileMenuFix(container) {
    const menu = container.querySelector("details.menu.mobile-nav");
    if (!menu) return;

    const summary = menu.querySelector(":scope > summary");
    if (!summary) return;

    summary.addEventListener(
      "click",
      (e) => {
        e.preventDefault();
        e.stopPropagation();
        menu.open = !menu.open;
      },
      { capture: true }
    );

    menu.querySelectorAll("a").forEach((a) => {
      a.addEventListener("click", () => {
        menu.open = false;
      });
    });

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

  // ✅ Universal FIX: portal dropdown desktop "Tecniche" in <body> per click garantiti su tutti i browser
  function initDropdownPortalAllBrowsers(container) {
    const details = container.querySelector('.desktop-nav details.submenu[data-nav="tecniche"]');
    if (!details) return;

    const summary = details.querySelector(":scope > summary");
    const menu = details.querySelector(":scope > .submenu-links");
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

      // se esce a destra, rientra
      const rect = menu.getBoundingClientRect();
      const maxRight = window.innerWidth - 10;
      if (rect.right > maxRight) {
        left = Math.max(10, left - (rect.right - maxRight));
        menu.style.left = `${left}px`;
      }

      // se esce in basso, prova sopra
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

    // Importantissimo: quando si apre/chiude
    details.addEventListener("toggle", () => {
      if (details.open) portalIn();
      else portalOut();
    });

    // Reposition on scroll/resize
    window.addEventListener("scroll", place, { passive: true });
    window.addEventListener("resize", place, { passive: true });

    // Chiudi se click fuori
    document.addEventListener("click", (e) => {
      if (!details.open) return;
      const clickInsideSummary = summary.contains(e.target);
      const clickInsideMenu = menu.contains(e.target);
      if (!clickInsideSummary && !clickInsideMenu) details.open = false;
    });

    // ✅ FIX click “sempre”: se per qualche motivo il click non parte, navighiamo noi
    menu.addEventListener("click", (e) => {
      const a = e.target.closest && e.target.closest("a[href]");
      if (!a) return;
      e.preventDefault();
      const href = a.getAttribute("href");
      if (href) window.location.href = href;
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
      initDesktopSubmenuCloseOnClick(host);
      initMobileMenuFix(host);
      initDropdownPortalAllBrowsers(host);

      window.addEventListener("popstate", () => setActiveNav(host));
    } catch (err) {
      console.error("Header load failed:", err);
    }
  }

  document.addEventListener("DOMContentLoaded", loadHeader);
})();
