fetch("header.html")
  .then((r) => r.text())
  .then((html) => {
    const mount = document.getElementById("site-header");
    if (!mount) return;

    mount.innerHTML = html;

    /* ==========================
       PAGINA ATTIVA
    ========================== */

    const normalize = (p) => {
      if (!p) return "/";
      p = p.split("?")[0].split("#")[0];
      if (p.endsWith("/index.html")) p = "/";
      if (!p.startsWith("/")) p = "/" + p;
      return p;
    };

    const currentPath = normalize(window.location.pathname);
    const links = mount.querySelectorAll("a[href]");

    let isTechniquePage = false;

    links.forEach((a) => {
      const href = a.getAttribute("href");
      if (!href || href.startsWith("#") || href.startsWith("mailto:")) return;

      let linkPath;
      try {
        linkPath = normalize(new URL(href, window.location.origin).pathname);
      } catch {
        return;
      }

      if (linkPath === currentPath) {
        a.classList.add("is-active");

        // se è una tecnica, segniamo il flag
        if (
          linkPath === "/surfcasting.html" ||
          linkPath === "/beach-ledgering.html" ||
          linkPath === "/spinning.html"
        ) {
          isTechniquePage = true;
        }
      }
    });

    /* ==========================
       ATTIVA "TECNICHE DI PESCA"
    ========================== */
    if (isTechniquePage) {
      mount
        .querySelectorAll(".submenu > summary")
        .forEach((summary) => summary.classList.add("is-active"));
    }

    /* ==========================
       HEADER SHRINK ON SCROLL
    ========================== */
    const header = mount.querySelector("header");
    if (header) {
      const onScroll = () => {
        if (window.scrollY > 10) header.classList.add("header--compact");
        else header.classList.remove("header--compact");
      };
      onScroll();
      window.addEventListener("scroll", onScroll, { passive: true });
    }
  })
  .catch(() => {
    console.warn("Header non caricato. Controlla header.html e il percorso.");
  });


