// header-loader.js
// Carica header.html dentro #site-header + evidenzia voce attiva + hide/show su scroll + Safari fixes

(function () {
  const HOST_ID = "site-header";
  const HEADER_URL = "/header.html";
  const VERSION = "20260214";

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

  function initHideShow(siteHeader) {
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

      if (y > lastY) siteHeader.style.transform = "translateY(-100%)";
      else siteHeader.style.transform = "translateY(0)";

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

  // Safari iOS: a volte <details><summary> non toggla bene in header fixed/trasformati.
  // Forziamo il toggle SOLO sul menu mobile principale.
  function initSafariDetailsFix(container) {
    const menu = container.querySelector("details.menu.mobile-nav");
    if (!menu) return;

    const summary = menu.querySelector(":scope > summary");
    if (!summary) return;

    summary.addEventListener("click", (e) => {
      // Lasciamo che i browser “normali” facciano il loro lavoro,
      // ma se Safari non apre, questo toggle lo rende deterministico.
      e.preventDefault();
      menu.open = !menu.open;
    });

    // Chiudi menu quando clicchi un link (più UX e evita stati strani su iOS)
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
      initSafariDetailsFix(host);
      initHideShow(host);

      window.addEventListener("popstate", () => setActiveNav(host));
    } catch (err) {
      console.error("Header load failed:", err);

      host.innerHTML = `
        <header>
          <div class="container">
            <div class="nav">
              <a class="brand" href="/"><div class="logo">🎣</div><div>apescaconfrank</div></a>
              <a class="cta" href="/#contatti">Contattami</a>
            </div>
          </div>
        </header>
      `;

      initHideShow(host);
    }
  }

  document.addEventListener("DOMContentLoaded", loadHeader);
})();
