fetch("header.html")
  .then((r) => r.text())
  .then((html) => {
    const mount = document.getElementById("site-header");
    if (!mount) return;

    mount.innerHTML = html;

    // ===== Evidenzia pagina attiva =====
    const normalize = (p) => {
      if (!p) return "/";
      // toglie query/hash, lascia solo path
      p = p.split("?")[0].split("#")[0];
      // se finisce con /index.html -> /
      if (p.endsWith("/index.html")) p = p.replace("/index.html", "/");
      // assicura leading slash
      if (!p.startsWith("/")) p = "/" + p;
      return p;
    };

    const currentPath = normalize(window.location.pathname);

    // tutti i link dentro header (desktop + mobile)
    const links = mount.querySelectorAll('a[href]');
    links.forEach((a) => {
      const href = a.getAttribute("href") || "";

      // ignora mailto / tel / ancore pure
      if (href.startsWith("mailto:") || href.startsWith("tel:") || href.startsWith("#")) return;

      // costruisce path assoluto da href (gestisce /, /pagina.html, pagina.html)
      let linkPath;
      try {
        linkPath = normalize(new URL(href, window.location.origin).pathname);
      } catch {
        return;
      }

      // regola: Home è "/" (o "/index.html" normalizzato)
      const isHomeLink = linkPath === "/";

      // match: stessa pagina
      const isMatch =
        linkPath === currentPath ||
        (isHomeLink && currentPath === "/");

      if (isMatch) a.classList.add("is-active");
    });

    // ===== Header che si compatta on scroll (pro) =====
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

