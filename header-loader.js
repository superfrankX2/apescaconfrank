// header-loader.js
// Carica header.html dentro #site-header + evidenzia link attivo + hide/show su scroll + scrollspy in home

(function () {
  const HOST_ID = "site-header";
  const HEADER_URL = "/header.html";

  function normalizePath(pathname) {
    if (!pathname || pathname === "") return "/";
    if (pathname.endsWith("/")) return pathname;
    return pathname;
  }

  function isHomePage() {
    const p = normalizePath(window.location.pathname);
    return p === "/" || p.endsWith("/index.html");
  }

  function clearActive(container) {
    container.querySelectorAll("a.is-active").forEach((el) => el.classList.remove("is-active"));
    container.querySelectorAll("details.submenu.is-active").forEach((el) => el.classList.remove("is-active"));

    // mobile: details "Tecniche" non ha class submenu, ma ha data-nav="tecniche"
    container.querySelectorAll('details[data-nav="tecniche"].is-active').forEach((el) => el.classList.remove("is-active"));
  }

  function setActiveByDataNav(container, key) {
    clearActive(container);

    // attiva tutti i link (desktop+mobile) con quel data-nav
    container.querySelectorAll(`a[data-nav="${key}"]`).forEach((a) => {
      // NON evidenziare il brand
      if (a.classList.contains("brand") || a.closest(".brand")) return;
      a.classList.add("is-active");
    });

    // se è "tecniche", evidenzia anche il details
    if (key === "tecniche") {
      const dDesktop = container.querySelector('details.submenu[data-nav="tecniche"]');
      if (dDesktop) dDesktop.classList.add("is-active");

      const dMobile = container.querySelector('details.menu-panel details[data-nav="tecniche"], details.mobile-nav details[data-nav="tecniche"]');
      if (dMobile) dMobile.classList.add("is-active");
    }
  }

  function setActiveNavByPath(container) {
    const current = normalizePath(window.location.pathname);

    const links = container.querySelectorAll('a[href]');
    links.forEach((a) => {
      const href = a.getAttribute("href");
      if (!href) return;

      // NON evidenziare il brand
      if (a.classList.contains("brand") || a.closest(".brand")) return;

      // consideriamo solo link interni assoluti
      if (!href.startsWith("/")) return;

      const hrefOnlyPath = href.split("#")[0];
      const hrefNorm = normalizePath(hrefOnlyPath);

      if (hrefNorm === current) {
        a.classList.add("is-active");

        // se è dentro submenu desktop
        const submenu = a.closest("details.submenu");
        if (submenu) {
          submenu.classList.add("is-active");
          submenu.open = true;
        }

        // se è dentro submenu mobile (details dentro li.submenu)
        const mobileSub = a.closest("li.submenu")?.querySelector("details");
        if (mobileSub) mobileSub.open = true;
      }
    });

    // Se siamo in una pagina tecnica, evidenzia anche "Tecniche" (oltre al link specifico)
    const techniquePages = ["/surfcasting.html", "/beach-ledgering.html", "/spinning.html"];
    if (techniquePages.includes(current)) {
      const dDesktop = container.querySelector('details.submenu[data-nav="tecniche"]');
      if (dDesktop) dDesktop.classList.add("is-active");
      const dMobile = container.querySelector('details.mobile-nav details[data-nav="tecniche"]');
      if (dMobile) dMobile.classList.add("is-active");
    }
  }

  function initScrollSpy(container) {
    if (!isHomePage()) return;

    const items = [
      { id: "top", nav: "home" },
      { id: "tecniche", nav: "tecniche" },
      { id: "chi-sono", nav: "chi-sono" },
      { id: "contatti", nav: "contatti" },
    ];

    const observed = [];
    items.forEach((it) => {
      const el = document.getElementById(it.id);
      if (el) observed.push({ ...it, el });
    });

    if (observed.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => (b.intersectionRatio || 0) - (a.intersectionRatio || 0))[0];

        if (!visible) return;

        const match = observed.find((o) => o.el === visible.target);
        if (match) setActiveByDataNav(container, match.nav);
      },
      {
        // header ~70px + un pelo di margine
        rootMargin: "-90px 0px -60% 0px",
        threshold: [0.15, 0.25, 0.4, 0.6],
      }
    );

    observed.forEach((o) => observer.observe(o.el));

    // Fallback iniziale: se non sei proprio in alto
    // (così appena carichi a metà pagina, attiva la sezione giusta)
    setTimeout(() => {
      const y = window.scrollY || 0;
      if (y < 60) setActiveByDataNav(container, "home");
    }, 50);
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

      // evidenzia pagina attiva (sempre)
      setActiveNavByPath(host);

      // scrollspy solo in home
      initScrollSpy(host);

      // hide/show
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
