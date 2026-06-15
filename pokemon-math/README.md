# Pokemon Math Adventure — game guide

## How to play

1. Open **[https://kurt-shadle.github.io/Pokemon-Math/](https://kurt-shadle.github.io/Pokemon-Math/)** (or run locally—see root [README](../README.md)).
2. Wait briefly for **Loading Pokemon…** (one quick fetch of `data/dex.json`). Pictures load as you play.
3. Choose **+ − × ÷**.
4. Use the two Pokémon **dex numbers** shown on the cards. The equation below is stacked like school worksheet paper—solve it, type your answer, tap **Check**.
5. On success, enjoy the Pokédex reveal, then **Next Problem** (or press Enter).

Wrong answers let you try again; the problem does not change until you get it right.

## My Pokédex

Tap **My Pokédex** in the header to open your collection.

- **Separate dex per operation** — catches in Addition do not fill Subtraction, etc. This encourages practicing every mode.
- **Repeat counts** — solving the same answer again increases the **×N** badge on that Pokémon.
- **Ranges shown**
  - **+ / −:** National Dex `#1` through `#maxDex` (from settings)
  - **× / ÷:** answer numbers `#1` through `#timesTableMax²` (default 1–121), since times-table math cannot cover the full National Dex

The header badge shows how many Pokémon you have discovered in the **current** operation mode.

## Backup and restore

Progress is stored in the browser on each device. It can be lost if site data is cleared, and it does not transfer between devices automatically.

In **My Pokédex** (footer):

| Button | What it does |
|--------|----------------|
| **Backup Pokédex** | Downloads `pokemon-math-pokedex-YYYY-MM-DD.json` — save to Drive, iCloud, or Notes |
| **Restore (merge)** | Picks a backup file and **adds** catches to this device (sums counts) |
| **Replace all** | Picks a backup file and **replaces** this device’s Pokédex (asks for confirmation) |

The app also asks the browser to keep saved data when possible (`navigator.storage.persist()`), which reduces surprise loss on phones when storage is tight—but **backup files are the real safety net**.

## Grass meadow

On **screens 500px and wider**, six Pokémon peek from the grass at the bottom. One always matches the correct answer—a fun hint for observant players. The meadow is hidden on phones so it stays out of the way of the touch keyboard.

## Tune difficulty

Edit [js/settings.js](js/settings.js):

| Setting | Default | Effect |
|---------|---------|--------|
| `minDex` | `1` | Lowest dex number used |
| `maxDex` | `550` | Highest dex for **+ / −** and size of addition/subtraction Pokédex grid |
| `timesTableMax` | `11` | Factors and quotients for **× / ÷** (11× table) |
| `grassCount` | `6` | Pokémon visible in the meadow (desktop/tablet only) |
| `warmImageCacheOnLoad` | `false` | Set `true` before a car trip to preload all sprites (slower startup) |

After increasing `maxDex`, run `node scripts/generate-dex.mjs [maxDex]` from the repo root, commit `data/dex.json`, and refresh.

## Offline / phone

See **[docs/OFFLINE.md](docs/OFFLINE.md)** for the car-trip preload and airplane-mode checklist.

- Use the **HTTPS** GitHub Pages link on the phone—not a downloaded zip.
- Trip-mode preload must happen **on that phone**; progress does not transfer from a computer unless you use **Backup / Restore**.

## Mobile

The UI uses large tap targets (~44px), safe-area padding for notched screens, a grid layout for problem cards on narrow widths, worksheet-style stacked equations, and smooth scrolling in the collection modal. Add to Home screen in Chrome for the best phone experience.

## Clear saved data

In the browser console on the game page:

```javascript
localStorage.removeItem("pokemonDex386_v1");
localStorage.removeItem("pokemonMathCollection_v1");
caches.delete("pokemon-math-v1");
```

Refresh on Wi‑Fi to rebuild caches. Your `.json` backup file is unaffected—use **Restore** to bring catches back.

## Tech notes

- No runtime build step—plain HTML, CSS, and JavaScript.
- Pokémon names ship in [`data/dex.json`](data/dex.json); sprites load from PokeAPI’s CDN as needed.
- Optional trip mode (`warmImageCacheOnLoad`) stores sprites in the **Cache API** for offline play; only fetches images not already cached.
- Regenerate dex data: `node scripts/generate-dex.mjs [maxDex]` (maintainer only).
- Collection state: `pokemonMathCollection_v1` in `localStorage` (per-operation catch counts).
- Backup export format: JSON with `version`, `exportedAt`, and `catches` per operation.

## Credits

- Data and sprites via [PokeAPI](https://pokeapi.co/)
- Pokémon names and characters © Nintendo / Game Freak / The Pokémon Company. Unofficial fan use for education at home.
