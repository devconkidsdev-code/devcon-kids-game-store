# DEVCON Kids Game Store — publish a game

How to add a new Google AI Studio game to the Classroom Play Store.

## 1. Drop the game folder

Copy the exported AI Studio project into `devconkids/` as its own folder, e.g.:

```text
devconkids/
  my-game/
    package.json
    vite.config.ts
    src/
    ...
```

**Rename the folder to a clean slug first** if AI Studio exported it with spaces, an apostrophe, an em dash (`—`), an exclamation mark, or an ampersand (`&`) in the name — use the same lowercase-hyphenated slug you'll use for the game's `id` below (e.g. `farmer's-water-quest_-wild-harvest` → `farmers-water-quest-wild-harvest`). These aren't just cosmetic: an `&` in the folder path breaks `npm run build` on Windows (`cmd.exe` treats it as a command separator), and an apostrophe in a `cover` image path breaks the store's CSS `background-image: url('...')` on the grid card. Both bugs have already bitten this project once — a clean slug avoids the whole class of issue.

## 2. Build with a relative base

Open the game’s `vite.config.ts` and set:

```ts
base: './',
```

Then build:

```bash
cd my-game
npm install
npm run build
```

This writes a playable build to `my-game/dist/` that works under `/devconkids/my-game/dist/`.

**Important for deployment:** the AI Studio export includes its own `my-game/.gitignore`, which excludes `dist/`. That's normally correct, but this project's live deployment (Vercel) serves the committed `dist/` folders directly with no build step — so after every rebuild, force-add the new output or it silently never reaches the deployed site:

```bash
git add -f my-game/dist
```

## 3. Register it in `games.json`

Add an entry at the top of [`games.json`](../games.json) (newest first is fine — the store sorts by `createdAt`):

```json
{
  "id": "my-game",
  "name": "My Game",
  "tagline": "One-line pitch.",
  "description": "Longer description of what kids built.",
  "creators": ["Kid One", "Kid Two"],
  "school": "School name or DEVCON chapter",
  "playUrl": "my-game/dist/",
  "cover": null,
  "accent": "#7A2FD4",
  "createdAt": "2026-08-20"
}
```

| Field | Notes |
| --- | --- |
| `id` | Unique slug; used in `game.html?id=…` |
| `playUrl` | Path to the built game (or `null` for Coming Soon) |
| `cover` | Optional image path; if `null`, a letter tile uses `accent` |
| `createdAt` | ISO date (`YYYY-MM-DD`); drives newest-first sort |

## 4. Open the store

Serve `devconkids/` via XAMPP and open `index.html`. Click a card → details → **Play Game**.

**Note:** Parent [`.htaccess`](../../.htaccess) may gate `/devconkids/` behind login. Add a bypass rule if the store should be public.
