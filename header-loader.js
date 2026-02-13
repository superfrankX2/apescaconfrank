(function () {
  const HOST_ID = "site-header";
  const HEADER_URL = "/header.html";

  function cleanPath(p) {
    if (!p) return "/";
    let s = String(p).split("?")[0].split("#")[0].toLowerCase();

    // home
    if (s === "/index.html") s = "/";

    // togli trailing slash
    if (s.length > 1 && s.endsWith("/")) s = s.slice(0, -1);

    return s || "/";
  }

  function setActiveNav(host) {
    const current = cleanPath(window.location.pathname);

    // reset
    host.querySelectorAll(".is-active").forEach((el) => el.classList.remove("is-active"));

    // trova tutti i link interni (esclusa brand)
    const links = host.querySelectorAll('a[href^="/"]');

    links.forEach((a) => {
      if (a.classList.contains("brand") || a.closest(".brand")) return;

      const href = a.getAttribute("href");
      if (!href) return;

      const hrefPath = cleanPath(href);

      // match esatto pagina
      if (hrefPath === current) {
        a.classList.add("is-active");

        // se è in submenu desktop
        const desktopDetails = a.closest("details.submenu");
        if (desktopDetails) {
          desktopDetails.classList.add("is-active");
          desktopDetails.open = true;
        }

        // se è in submenu mobile (details dentro li.submenu)
        const mobileOwnerDetails = a.closest("li.submenu")?.querySelector("details");
        if (mobileOwnerDetails) {
          mobileOwnerDetails.open = true;
          mobileOwnerDetails.classList.add("is-active");
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

      siteHeader.style.transform = y > lastY ? "translateY(-100%)" : "translateY(0)";
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
