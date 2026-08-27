(function () {
  "use strict";

  const root = document.getElementById("game-detail");

  function escapeHtml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function getId() {
    return new URLSearchParams(window.location.search).get("id");
  }

  function formatDate(iso) {
    if (!iso) return "—";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return escapeHtml(iso);
    return d.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }

  function coverBlock(game) {
    const accent = game.accent || "#7a2fd4";
    const letter = escapeHtml((game.name || "?").trim().charAt(0).toUpperCase() || "?");

    if (game.cover) {
      return `
        <div class="detail-cover" style="background-color: ${escapeHtml(accent)};">
          <img src="${escapeHtml(game.cover)}" alt="" />
        </div>
      `;
    }

    return `
      <div
        class="detail-cover"
        style="background: linear-gradient(145deg, ${escapeHtml(accent)} 0%, #7a2fd4 100%);"
        aria-hidden="true"
      >${letter}</div>
    `;
  }

  function playButton(game) {
    if (game.playUrl) {
      return `<a class="btn" href="${escapeHtml(game.playUrl)}">Play Game</a>`;
    }
    return `<button class="btn" type="button" disabled aria-disabled="true">Coming Soon</button>`;
  }

  function creators(game) {
    const list = Array.isArray(game.creators) ? game.creators : [];
    if (!list.length) return `<p>—</p>`;
    return `
      <div class="chips">
        ${list.map((name) => `<span class="chip">${escapeHtml(name)}</span>`).join("")}
      </div>
    `;
  }

  function renderNotFound() {
    document.title = "Game not found · DEVCON Kids";
    root.innerHTML = `
      <div class="not-found">
        <h1>Game not found</h1>
        <p>That game isn’t in the store yet.</p>
        <a class="btn" href="index.html">Back to games</a>
      </div>
    `;
  }

  function render(game) {
    document.title = `${game.name} · DEVCON Kids`;
    root.innerHTML = `
      <article class="detail">
        ${coverBlock(game)}
        <div class="detail-main">
          <h1>${escapeHtml(game.name)}</h1>
          <p class="detail-tagline">${escapeHtml(game.tagline || "")}</p>
          ${playButton(game)}

          <section class="detail-section">
            <h2>About</h2>
            <p>${escapeHtml(game.description || "")}</p>
          </section>

          <section class="detail-section">
            <h2>Created by</h2>
            ${creators(game)}
          </section>

          <div class="meta-row">
            <div>
              <strong>School / Chapter</strong>
              ${escapeHtml(game.school || "—")}
            </div>
            <div>
              <strong>Added</strong>
              ${formatDate(game.createdAt)}
            </div>
          </div>
        </div>
      </article>
    `;
  }

  async function init() {
    const id = getId();
    if (!id) {
      renderNotFound();
      return;
    }

    try {
      const res = await fetch("games.json", { cache: "no-store" });
      if (!res.ok) throw new Error(`Failed to load games (${res.status})`);
      const data = await res.json();
      const games = Array.isArray(data) ? data : [];
      const game = games.find((g) => g.id === id);
      if (!game) {
        renderNotFound();
        return;
      }
      render(game);
    } catch (err) {
      console.error(err);
      root.innerHTML = `<p class="state error">Could not load this game. Check games.json.</p>`;
    }
  }

  init();
})();
