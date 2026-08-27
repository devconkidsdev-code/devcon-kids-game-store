(function () {
  "use strict";

  const grid = document.getElementById("game-grid");
  const searchInput = document.getElementById("search");
  let games = [];

  function escapeHtml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function coverStyle(game) {
    const accent = game.accent || "#7a2fd4";
    if (game.cover) {
      return `background-image: linear-gradient(180deg, rgba(0,0,0,0.05), rgba(0,0,0,0.25)), url('${escapeHtml(game.cover)}'); background-color: ${escapeHtml(accent)};`;
    }
    return `background: linear-gradient(145deg, ${escapeHtml(accent)} 0%, #7a2fd4 100%);`;
  }

  function letter(game) {
    return escapeHtml((game.name || "?").trim().charAt(0).toUpperCase() || "?");
  }

  function isNew(game) {
    if (!game.createdAt) return false;
    const created = new Date(game.createdAt);
    if (Number.isNaN(created.getTime())) return false;
    const days = (Date.now() - created.getTime()) / (1000 * 60 * 60 * 24);
    return days <= 14;
  }

  function sortByNewest(list) {
    return [...list].sort((a, b) => {
      const da = new Date(a.createdAt || 0).getTime();
      const db = new Date(b.createdAt || 0).getTime();
      return db - da;
    });
  }

  function matchesQuery(game, query) {
    if (!query) return true;
    const haystack = [
      game.name,
      game.tagline,
      game.description,
      game.school,
      ...(game.creators || []),
    ]
      .join(" ")
      .toLowerCase();
    return haystack.includes(query);
  }

  function render(list) {
    if (!list.length) {
      grid.innerHTML = `<p class="state">No games match your search.</p>`;
      return;
    }

    grid.innerHTML = list
      .map((game) => {
        const badge = game.playUrl
          ? isNew(game)
            ? `<span class="badge">New</span>`
            : `<span class="badge">Playable</span>`
          : `<span class="badge soon">Coming soon</span>`;

        return `
          <a class="game-card" href="game.html?id=${encodeURIComponent(game.id)}">
            <div class="card-cover" style="${coverStyle(game)}" aria-hidden="true">${game.cover ? "" : letter(game)}</div>
            <div class="card-body">
              <h3>${escapeHtml(game.name)}</h3>
              <p class="card-tagline">${escapeHtml(game.tagline || "")}</p>
              <div class="card-meta">
                <span>${escapeHtml(game.school || "")}</span>
                ${badge}
              </div>
            </div>
          </a>
        `;
      })
      .join("");
  }

  function applyFilter() {
    const query = (searchInput.value || "").trim().toLowerCase();
    render(sortByNewest(games.filter((g) => matchesQuery(g, query))));
  }

  async function init() {
    try {
      const res = await fetch("games.json", { cache: "no-store" });
      if (!res.ok) throw new Error(`Failed to load games (${res.status})`);
      const data = await res.json();
      games = Array.isArray(data) ? data : [];
      applyFilter();
    } catch (err) {
      console.error(err);
      grid.innerHTML = `<p class="state error">Could not load games. Check games.json.</p>`;
    }
  }

  searchInput.addEventListener("input", applyFilter);
  init();
})();
