fetch("header.html")
  .then((r) => r.text())
  .then((html) => {
    document.getElementById("site-header").innerHTML = html;
  })
  .catch(() => {
    console.warn("Header non caricato. Controlla header.html e il percorso.");
  });
