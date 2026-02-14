// header-loader.js
// Carica header.html dentro #site-header + evidenzia voce attiva + hide/show su scroll (Safari-safe) + fix menu iOS

(function () {
  const HOST_ID = "site-header";
  const HEADER_URL = "/header.html";
  const VERSION = "20260215";

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

  // 🔥 SAFARI SAFE: trasformiamo l’header interno, non il contenitore fixed
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

  // ✅ iOS Safari: toggle manuale del menu mobile (più affidabile)
  function initMobileMenuFix(container) {
    const menu = container.querySelector("details.menu.mobile-nav");
    if (!menu) return;

    const summary = menu.querySelector(":scope > summary");
    if (!summary) return;

    // pointerdown > click su iOS Safari
    summary.addEventListener("pointerdown", (e) => {
      e.preventDefault();
      e.stopPropagation();
      menu.open = !menu.open;
    });

    // Chiudi quando clicchi un link
    menu.querySelectorAll("a").forEach((a) => {
      a.addEventListener("click", () => {
        menu.open = false;
      });
    });

    // Chiudi cliccando fuori
    document.addEventListener("pointerdown", (e) => {
      if (!menu.open) return;
      if (!menu.contains(e.target)) menu.open = false;
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

      window.addEventListener("popstate", () => setActiveNav(host));
    } catch (err) {
      console.error("Header load failed:", err);

      host.innerHTML = `
        <header class="site-header-inner">
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
