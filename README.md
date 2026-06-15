# Pokemon Math Adventure

A free, browser-based math game for kids. Each problem shows two Pokémon with their **National Dex numbers**—your child solves a **stacked worksheet-style** equation (like school paper), and a correct answer “registers” that Pokémon in their Pokédex.

Built for home use, works on **phones and desktops**, and supports **optional offline play** after enabling trip mode ([preload guide](pokemon-math/docs/OFFLINE.md)).

## Play online

**https://kurt-shadle.github.io/Pokemon-Math/**

| Requirement | Notes |
|-------------|--------|
| **Public repo** | GitHub Pages on a free account requires this repository to be **public**. |
| **Pages enabled** | Repo → **Settings → Pages** → **Build and deployment** → Source: **GitHub Actions**. Pushes to `main` deploy automatically (see [.github/workflows/pages.yml](.github/workflows/pages.yml)). |

**Phone tip:** Open in Chrome → **Add to Home screen** for a one-tap icon. Layout is optimized for touch (large buttons, safe areas for notches).

## Features

- **Four operations:** addition, subtraction, multiplication, division
- **Worksheet-style problems** — numbers stacked vertically with the operator on the second line (better for carrying/borrowing habits)
- **Pokédex success screen** when an answer is correct (themed “entry registered” UI)
- **My Pokédex** — separate collection per operation (+, −, ×, ÷), with **repeat catch counts** (×2, ×3, …)
- **Backup & restore** — download a `.json` backup from My Pokédex; merge or replace progress if browser data is cleared or you switch devices
- **Grass meadow** (tablets/desktop) — decorative Pokémon peeking from the bottom; one matches the answer. Hidden on phones to save space and avoid the keyboard.
- **Fast startup** — Pokémon names ship in `data/dex.json`; sprites load from the CDN as you play
- **Digit-only answer input** — letters and symbols are stripped as they type
- **Offline-friendly (optional)** — set `warmImageCacheOnLoad: true` before a trip to preload sprites ([preload guide](pokemon-math/docs/OFFLINE.md))
- **Configurable difficulty** — edit `maxDex` and times-table limits in [pokemon-math/js/settings.js](pokemon-math/js/settings.js)

## Car trip / no Wi‑Fi

Do **not** rely on copying files to the phone. Preload on the device he will use:

1. Set `warmImageCacheOnLoad: true` in settings, deploy, then open on Wi‑Fi  
2. Wait for **Caching images…** to finish  
3. Play each operation mode; scroll **My Pokédex** tabs  
4. **Backup Pokédex** and save the file somewhere safe (optional but recommended)  
5. Add to Home screen  
6. **Airplane mode test** before you leave  

Full checklist: **[pokemon-math/docs/OFFLINE.md](pokemon-math/docs/OFFLINE.md)**

Progress lives in the browser on each device. Use **Backup Pokédex** to move or recover catches—it does not sync automatically.

## Project layout

```
pokemon-math/
  index.html          # Game entry point
  styles.css          # Layout (mobile-first)
  data/
    dex.json          # Pokémon id + name (shipped with app)
  js/
    app.js            # Game loop, input sanitization
    problems.js       # Problem generators
    pokemon-data.js   # Dex load + optional image cache
    collection.js     # Per-operation catch storage + backup
    collection-ui.js  # My Pokédex modal
    grass-scene.js    # Meadow decorations (desktop)
    settings.js       # Difficulty tuning
  docs/OFFLINE.md     # Pre-trip / offline steps
scripts/
  generate-dex.mjs    # Regenerate dex.json when maxDex grows
```

Details and settings: **[pokemon-math/README.md](pokemon-math/README.md)**

## Run locally

From the `pokemon-math` folder, serve over HTTP (not `file://`):

```bash
cd pokemon-math
python -m http.server 8080
```

Open `http://localhost:8080`. Sprites load from the CDN as you play; internet required unless trip mode has preloaded images.

## Credits

- Pokémon data and sprites via [PokeAPI](https://pokeapi.co/)
- Pokémon © Nintendo / Game Freak / The Pokémon Company. Unofficial fan project for education at home.
