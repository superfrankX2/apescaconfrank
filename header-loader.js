(function () {
  const HOST_ID = "site-header";
  const HEADER_URL = "/header.html";

  function cleanPath(p) {
    if (!p) return "/";
    let s = p.split("?")[0].split("#")[0].toLowerCase();

    // normalizza home
    if (s === "/index.html") return "/";

    // se finisce con / lascia /
    if (s.length > 1 && s.endsWith("/")) s = s.slice(0, -1);

    // normalizza: /chi-sono.html -> /chi-sono
    if (s.endsWith(".html")) s = s.slice(0, -5);

    return s || "/";
  }

  function setActiveNav(container) {
    const current = cleanPath(window.location.pathname);

    // pulizia
    container.querySelectorAll("a.is-active").forEach((a) => a.classList.remove("is-active"));
    container.querySelectorAll("details.submenu.is-active").forEach((d) => d.classList.remove("is-active"));

    const links = container.querySelectorAll('a[href^="/"]');

    links.forEach((a) => {
      if (a.classList.contains("brand") || a.closest(".brand")) return;

      const href = a.getAttribute("href");
      if (!href) return;

      const hrefPath = cleanPath(href);

      // match robusto
      if (hrefPath === current) {
        a.classList.add("is-active");

        // se sta dentro submenu desktop
        const submenu = a.closest("details.submenu");
        if (submenu) {
          submenu.classList.add("is-active");
          submenu.open = true;
        }

        // se sta dentro submenu mobile
        const mobileDetails = a.closest(".menu-panel")?.querySelector("li.submenu details");
        if (mobileDetails) {
          // non aprire tutto a caso: apri solo se il link è dentro quel details
          const owner = a.closest("li.submenu")?.querySelector("details");
          if (owner) owner.open = true;
        }
      }
    });
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

      siteHeader.style.transform = (y > lastY) ? "translateY(-100%)" : "translateY(0)";
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
      const res = await fetch(`${HEADER_URL}?v=20260213`, { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status} loading ${HEADER_URL}`);

      host.innerHTML = await res.text();

      setActiveNav(host);
      initHideShow(host);
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
