(function () {
  const HOST_ID = "site-footer";
  const FOOTER_URL = "/footer.html";
  const VERSION = "20260215";

  async function loadFooter() {
    const host = document.getElementById(HOST_ID);
    if (!host) return;

    try {
      const res = await fetch(`${FOOTER_URL}?v=${VERSION}`, { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status} loading ${FOOTER_URL}`);
      host.innerHTML = await res.text();
    } catch (err) {
      console.error("Footer load failed:", err);
    }
  }

  document.addEventListener("DOMContentLoaded", loadFooter);
})();
