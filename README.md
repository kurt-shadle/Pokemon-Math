# Pokemon Math Adventure

A free, browser-based math game for kids. Each problem shows two Pokémon with their **National Dex numbers**—your child solves the equation, and a correct answer “registers” that Pokémon in their Pokédex.

Built for home use, works on **phones and desktops**, and supports **offline play** after a one-time Wi‑Fi preload (great for car trips).

## Play online

**https://kurt-shadle.github.io/Pokemon-Math/**

| Requirement | Notes |
|-------------|--------|
| **Public repo** | GitHub Pages on a free account requires this repository to be **public**. |
| **Pages enabled** | Repo → **Settings → Pages** → **Build and deployment** → Source: **GitHub Actions**. Pushes to `main` deploy automatically (see [.github/workflows/pages.yml](.github/workflows/pages.yml)). |

**Phone tip:** Open in Chrome → **Add to Home screen** for a one-tap icon. Layout is optimized for touch (large buttons, safe areas for notches).

## Features

- **Four operations:** addition, subtraction, multiplication, division
- **Pokédex success screen** when an answer is correct (themed “entry registered” UI)
- **My Pokédex** — separate collection per operation (+, −, ×, ÷), with **repeat catch counts** (×2, ×3, …)
- **Grass meadow** — decorative Pokémon peeking from the bottom (one matches the answer)
- **Digit-only answer input** — letters and symbols are stripped as they type
- **Offline-friendly** — after one online visit, names and sprites are cached in the browser ([preload guide](pokemon-math/docs/OFFLINE.md))
- **Configurable difficulty** — edit `maxDex` and times-table limits in [pokemon-math/js/settings.js](pokemon-math/js/settings.js)

## Car trip / no Wi‑Fi

Do **not** rely on copying files to the phone. Preload on the device he will use:

1. Full load + **Caching images…** on Wi‑Fi  
2. Play each operation mode; scroll **My Pokédex** tabs  
3. Add to Home screen  
4. **Airplane mode test** before you leave  

Full checklist: **[pokemon-math/docs/OFFLINE.md](pokemon-math/docs/OFFLINE.md)**

Progress (`localStorage`) stays on that phone only—it does not sync from your PC.

## Project layout

```
pokemon-math/
  index.html          # Game entry point
  styles.css          # Layout (mobile-first)
  js/
    app.js            # Game loop, input sanitization
    problems.js       # Problem generators
    pokemon-data.js   # PokeAPI load + image cache
    collection.js     # Per-operation catch storage
    collection-ui.js  # My Pokédex modal
    grass-scene.js    # Meadow decorations
    settings.js       # Difficulty tuning
  docs/OFFLINE.md     # Pre-trip / offline steps
```

Details and settings: **[pokemon-math/README.md](pokemon-math/README.md)**

## Run locally

From the `pokemon-math` folder, serve over HTTP (not `file://`):

```bash
cd pokemon-math
python -m http.server 8080
```

Open `http://localhost:8080`. First run needs internet to fetch Pokémon data.

## Credits

- Pokémon data and sprites via [PokeAPI](https://pokeapi.co/)
- Pokémon © Nintendo / Game Freak / The Pokémon Company. Unofficial fan project for education at home.
