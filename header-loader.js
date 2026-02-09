// header-loader.js
// Carica header.html dentro #site-header + evidenzia link attivo + hide/show su scroll

(function () {
  const HOST_ID = "site-header";
  const HEADER_URL = "/header.html";

  function normalizePath(pathname) {
    // Normalizza: "/" oppure "/surfcasting.html"
    if (!pathname || pathname === "") return "/";
    if (pathname.endsWith("/")) return pathname;
    return pathname;
  }

  function setActiveNav(container) {
    const current = normalizePath(window.location.pathname);

    // Marca active tutti i link che matchano pathname
    const links = container.querySelectorAll('a[href]');
    links.forEach((a) => {
      const href = a.getAttribute("href");
      if (!href) return;

      // NON evidenziare il brand (apescaconfrank) come voce attiva
      if (a.classList.contains("brand") || a.closest(".brand")) return;

      // Considera solo link interni (iniziano con "/")
      if (!href.startsWith("/")) return;

      // Normalizza href
      const hrefNorm = normalizePath(href);

      if (hrefNorm === current) {
        a.classList.add("is-active");

        // Se è dentro un <details class="submenu"> aprilo e marca active
        const submenu = a.closest("details.submenu");
        if (submenu) {
          submenu.classList.add("is-active");
          submenu.open = true;
        }

        // Se è dentro submenu mobile (details dentro li.submenu)
        const mobileSub = a.closest("li.submenu")?.querySelector("details");
        if (mobileSub) {
          mobileSub.open = true;
        }
      }
    });
  }

  function initHideShow(siteHeader) {
    let lastY = window.scrollY || 0;
    let ticking = false;

    function onScroll() {
      const y = window.scrollY || 0;

      // evita micro-jitter
      const delta = y - lastY;
      if (Math.abs(delta) < 6) {
        lastY = y;
        ticking = false;
        return;
      }

      // se scendi: nascondi, se sali: mostra
      if (y > lastY) {
        siteHeader.style.transform = "translateY(-100%)";
      } else {
        siteHeader.style.transform = "translateY(0)";
      }

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
      const res = await fetch(`${HEADER_URL}?v=20260209`, { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status} loading ${HEADER_URL}`);

      const html = await res.text();
      host.innerHTML = html;

      // Ora che esiste nel DOM:
      setActiveNav(host);
      initHideShow(host);
    } catch (err) {
      console.error("Header load failed:", err);

      // fallback minimale (così non resti senza nav)
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

  // Avvia
  document.addEventListener("DOMContentLoaded", loadHeader);
})();
