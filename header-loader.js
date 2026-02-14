// header-loader.js
// Carica header.html dentro #site-header + evidenzia voce attiva
// + hide/show su scroll (sul header interno)
// + FIX Safari desktop dropdown (posizionamento fixed)
// + FIX iOS Safari menu mobile (toggle affidabile)

(function () {
  const HOST_ID = "site-header";
  const HEADER_URL = "/header.html";
  const VERSION = "20260217";

  function normalizePath(pathname) {
    let p = (pathname || "/").toLowerCase();
    p = p.split("?")[0].split("#")[0];
    if (p === "/index" || p === "/index.html") p = "/";
    p = p.replace(/\.html$/i, "");
    if (p.length > 1 && p.endsWith("/")) p = p.slice(0, -1);
    return p;
  }

  function isSafari() {
    const ua = navigator.userAgent;
    return /safari/i.test(ua) && !/chrome|crios|android/i.test(ua);
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
      const desktopDetails = container.querySelector(`details.submenu[data-nav="tecniche"]`);
      if (desktopDetails) {
        desktopDetails.classList.add("is-active");
        desktopDetails.open = true;
      }
      const mobileDetails = container.querySelector(`.mobile-nav details[data-nav="tecniche"]`);
      if (mobileDetails) mobileDetails.open = true;
    }
  }

  // Hide/Show: trasformiamo l’header interno, non #site-header (fixed)
  function initHideShow(container) {
    const innerHeader = container.querySelector(".site-header-inner") || container.querySelector("header");
    if (!innerHeader) return;

    let lastY = window.scrollY || 0;
    let ticking = false;

    function onScroll() {
      const y = window.scrollY || 0;
      const delta = y - lastY;

      if (Math.abs(delta) < 6) {
        lastY = y;
        ticking = false;
        return;
      }

      if (y > lastY) innerHeader.style.transform = "translateY(-110%)";
      else innerHeader.style.transform = "translateY(0)";

      lastY = y;
      ticking = false;
    }

    window.addEventListener(
      "scroll",
      () => {
        if (!ticking) {
          ticking = true;
          window.requestAnimationFrame(onScroll);
        }
      },
      { passive: true }
    );
  }

  // ✅ FIX Safari desktop: dropdown “Tecniche” non va sotto (lo mettiamo fixed con coordinate)
  function initSafariDesktopDropdownFix(container) {
    if (!isSafari()) return;

    const details = container.querySelector('.desktop-nav details.submenu[data-nav="tecniche"]');
    if (!details) return;

    const summary = details.querySelector(":scope > summary");
    const menu = details.querySelector(":scope > .submenu-links");
    if (!summary || !menu) return;

    function placeMenuFixed() {
      if (!details.open) return;

      const r = summary.getBoundingClientRect();

      // Posizioniamo sotto il summary
      const top = Math.round(r.bottom + 8);
      const left = Math.round(r.left);

      menu.style.position = "fixed";
      menu.style.top = `${top}px`;
      menu.style.left = `${left}px`;
      menu.style.right = "auto";
      menu.style.zIndex = "999999";
      menu.style.transform = "translateZ(0)";

      // Se sfora a destra, rientra
      const menuRect = menu.getBoundingClientRect();
      const overflowRight = menuRect.right - (window.innerWidth - 10);
      if (overflowRight > 0) {
        menu.style.left = `${Math.max(10, left - overflowRight)}px`;
      }

      // Se sfora sotto, prova ad aprire verso l’alto
      const overflowBottom = menuRect.bottom - (window.innerHeight - 10);
      if (overflowBottom > 0) {
        const aboveTop = Math.max(10, Math.round(r.top - 8 - menuRect.height));
        menu.style.top = `${aboveTop}px`;
      }
    }

    function resetMenu() {
      menu.style.position = "";
      menu.style.top = "";
      menu.style.left = "";
      menu.style.right = "";
      menu.style.zIndex = "";
      menu.style.transform = "";
    }

    details.addEventListener("toggle", () => {
      if (details.open) {
        placeMenuFixed();
      } else {
        resetMenu();
      }
    });

    window.addEventListener("resize", placeMenuFixed, { passive: true });
    window.addEventListener("scroll", placeMenuFixed, { passive: true });
  }

  // ✅ FIX iOS Safari: menu mobile che non si apre
  function initMobileMenuFix(container) {
    const menu = container.querySelector("details.menu.mobile-nav");
    if (!menu) return;

    const summary = menu.querySelector(":scope > summary");
    if (!summary) return;

    // Rendiamo il toggle deterministico su iOS/Safari
    const toggle = (e) => {
      e.preventDefault();
      e.stopPropagation();
      menu.open = !menu.open;
    };

    summary.addEventListener("touchstart", toggle, { passive: false });
    summary.addEventListener("click", toggle);

    // Chiudi quando clicchi un link
    menu.querySelectorAll("a").forEach((a) => {
      a.addEventListener("click", () => {
        menu.open = false;
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
      initMobileMenuFix(host);
      initHideShow(host);
      initSafariDesktopDropdownFix(host);

      window.addEventListener("popstate", () => setActiveNav(host));
    } catch (err) {
      console.error("Header load failed:", err);
    }
  }

  document.addEventListener("DOMContentLoaded", loadHeader);
})();
