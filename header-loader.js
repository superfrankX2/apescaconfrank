// header-loader.js
// Carica header.html dentro #site-header + evidenzia voce attiva (data-nav) + hide/show su scroll

(function () {
  const HOST_ID = "site-header";
  const HEADER_URL = "/header.html";
  const VERSION = "20260213";

  // Mappa path -> data-nav
  function getNavKeyFromPath(pathname) {
  let p = (pathname || "/").toLowerCase();

  // normalizza: toglie trailing slash (tranne "/")
  if (p.length > 1 && p.endsWith("/")) p = p.slice(0, -1);

  // home
  if (p === "/" || p.endsWith("/index") || p.endsWith("/index.html")) return "home";

  // prende l'ultimo pezzo del path: "chi-sono" oppure "chi-sono.html"
  const last = p.split("/").pop() || "";
  const slug = last.replace(/\.html$/i, ""); // toglie .html se c'è

  // mappa slug -> data-nav
  const map = {
    "chi-sono": "chi-sono",
    "pricing": "pricing",
    "surfcasting": "surfcasting",
    "beach-ledgering": "beach-ledgering",
    "spinning": "spinning",
  };

  return map[slug] || null;
}


  function setActiveNav(container) {
    const key = getNavKeyFromPath(window.location.pathname);

    // pulizia (se per qualche motivo ricarichi header più volte)
    container.querySelectorAll(".is-active").forEach((el) => el.classList.remove("is-active"));

    if (!key) return;

    // evidenzia il link con data-nav corrispondente
    const activeLink = container.querySelector(`[data-nav="${key}"]`);
    if (activeLink) activeLink.classList.add("is-active");

    // se è una tecnica: attiva anche "Tecniche di pesca" (desktop details + mobile details)
    const isTechnique = ["surfcasting", "beach-ledgering", "spinning"].includes(key);
    if (isTechnique) {
      // Desktop: <details class="submenu" data-nav="tecniche">
      const desktopDetails = container.querySelector(`details.submenu[data-nav="tecniche"]`);
      if (desktopDetails) {
        desktopDetails.classList.add("is-active");
        desktopDetails.open = true;
      }

      // Mobile: <li class="submenu"><details data-nav="tecniche">
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
