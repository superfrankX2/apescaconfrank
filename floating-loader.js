// floating-loader.js
(function () {
  const HOST_ID = "floating-ui";
  const URL = "/floating.html";
  const VERSION = "20260229"; // bump per cache-bust

  async function loadFloating() {
    const host = document.getElementById(HOST_ID);
    if (!host) return;

    try {
      const res = await fetch(`${URL}?v=${VERSION}`, { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status} loading ${URL}`);
      host.innerHTML = await res.text();
    } catch (err) {
      console.error("Floating UI load failed:", err);
    }
  }

  document.addEventListener("DOMContentLoaded", loadFloating);
})();
