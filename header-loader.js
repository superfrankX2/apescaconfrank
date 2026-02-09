fetch("header.html")
  .then((r) => r.text())
  .then((html) => {
    document.getElementById("site-header").innerHTML = html;

    const header = document.querySelector("header");
    if (!header) return;

    const onScroll = () => {
      if (window.scrollY > 10) header.classList.add("header--compact");
      else header.classList.remove("header--compact");
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  })
  .catch(() => {
    console.warn("Header non caricato. Controlla header.html e il percorso.");
  });

