fetch("header.html")
  .then((r) => r.text())
  .then((html) => {
    const mount = document.getElementById("site-header");
    if (!mount) return;

    mount.innerHTML = html;

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
      if (!href || href.startsWith("#") || href.startsWith("mailto")) return;

      const linkPath = normalize(
        new URL(href, window.location.origin).pathname
      );

      if (linkPath === currentPath) {
        a.classList.add("is-active");

        if (
          linkPath === "/surfcasting.html" ||
          linkPath === "/beach-ledgering.html" ||
          linkPath === "/spinning.html"
        ) {
          isTechniquePage = true;
        }
      }
    });

    /* ===== evidenzia TUTTO il blocco Tecniche ===== */
    if (isTechniquePage) {
      mount
        .querySelectorAll("details.submenu, .submenu details")
        .forEach((d) => d.classList.add("is-active"));
    }

    /* ===== shrink header ===== */
    const header = mount.querySelector("header");
    if (header) {
      const onScroll = () => {
        header.classList.toggle("header--compact", window.scrollY > 10);
      };
      onScroll();
      window.addEventListener("scroll", onScroll, { passive: true });
    }
  })
  .catch(() => {
    console.warn("Header non caricato.");
  });



