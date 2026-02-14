// header-loader.js
// Carica header.html dentro #site-header + evidenzia voce attiva + hide/show su scroll

(function () {
  const HOST_ID = "site-header";
  const HEADER_URL = "/header.html";
  const VERSION = "20260214";

  function normalizePath(pathname) {
    let p = (pathname || "/").toLowerCase();

    // rimuovi query/hash se arrivassero dentro (paranoia)
    p = p.split("?")[0].split("#")[0];

    // /index e /index.html -> /
    if (p === "/index" || p === "/index.html") p = "/";

    // rimuovi .html
    p = p.replace(/\.html$/i, "");

    // rimuovi trailing slash (tranne root)
    if (p.length > 1 && p.endsWith("/")) p = p.slice(0, -1);

    return p;
  }

  function clearActive(container) {
    container.querySelectorAll(".is-active").forEach((el) => el.classList.remove("is-active"));
  }

  function setActiveNav(container) {
    const current = normalizePath(window.location.pathname);

    clearActive(container);

    // prendo tutti i link con data-nav (desktop + mobile), escludo CTA (contattami) che non va "attivata"
    const navLinks = Array.from(container.querySelectorAll('a[data-nav]:not(.cta)'));

    let activeLink = null;

    for (const link of navLinks) {
      const href = link.getAttribute("href");
      if (!href) continue;

      // costruisco un URL assoluto e confronto solo il pathname normalizzato
      const linkPath = normalizePath(new URL(href, window.location.origin).pathname);

      if (linkPath === current) {
        activeLink = link;
        break;
      }

      // fallback home: se sono su "/" deve matchare solo "/"
      // (già coperto da normalize, ma lasciato chiaro)
    }

    // Se non ho trovato match esatto, provo un fallback “slug” (utile se hai redirect particolari)
    if (!activeLink) {
      const last = current.split("/").pop() || "";
      activeLink = container.querySelector(`[data-nav="${last}"]`);
    }

    if (activeLink) activeLink.classList.add("is-active");

    // se è una tecnica: attiva anche "Tecniche di pesca" (desktop + mobile)
    const activeKey = activeLink ? activeLink.getAttribute("data-nav") : null;
    const isTechnique = ["surfcasting", "beach-ledgering", "spinning"].includes(activeKey);

    if (isTechnique) {
      // Desktop details
      const desktopDetails = container.querySelector(`details.submenu[data-nav="tecniche"]`);
      if (desktopDetails) {
        desktopDetails.classList.add("is-active");
        desktopDetails.open = true;
      }

      // Mobile details
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

  async function loadHeader() {
    const host = document.getElementById(HOST_ID);
    if (!host) return;

    try {
      const res = await fetch(`${HEADER_URL}?v=${VERSION}`, { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status} loading ${HEADER_URL}`);

      host.innerHTML = await res.text();

      setActiveNav(host);
      initHideShow(host);

      // se cambi hash (es. /#contatti) non devo cambiare active,
      // ma se fai navigazione interna con History API in futuro, qui sei coperto:
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
