# Offline / car trip setup (Android)

By default the game starts quickly and loads Pokémon pictures on demand. For a car trip with no Wi‑Fi, turn on **trip mode** once on Wi‑Fi so sprites are saved in the browser.

## Live link (use this on the phone)

After GitHub Pages is enabled:

**https://kurt-shadle.github.io/Pokemon-Math/**

(Repo: [kurt-shadle/Pokemon-Math](https://github.com/kurt-shadle/Pokemon-Math) → **Settings → Pages** → source: **GitHub Actions**.)

## Before you leave (Wi‑Fi required)

Do all of this **on the Android phone** he will use in the car (not on your PC).

1. In [js/settings.js](../js/settings.js) on the deployed site (or your branch before deploy), set **`warmImageCacheOnLoad: true`**, then deploy or use that build.  
   *(Or edit locally, push, and wait for GitHub Pages to update.)*
2. Open the link above in **Chrome**.
3. Wait until **Loading Pokemon…** finishes, then wait for **Caching images…** to complete.
4. Solve a few problems in **each** mode: **+**, **−**, **×**, **÷** (saves My Pokédex progress on this device).
5. Open **My Pokédex** → switch each tab → **scroll the full grid slowly** so sprites load.
6. Chrome menu → **Add to Home screen** (or **Install app**).
7. **Airplane mode verification (required):**
   - Turn Wi‑Fi off (or airplane mode on).
   - Open the game from the **home screen** shortcut (not a new tab).
   - [ ] A new math problem loads (+/−/×/÷).
   - [ ] Pokémon **pictures** show on the problem cards.
   - [ ] **My Pokédex** opens and previously caught Pokémon still show with counts.
   - If any box fails: Wi‑Fi on → confirm `warmImageCacheOnLoad: true` → refresh → wait for **Caching images…** → scroll all four Pokédex tabs → repeat step 7.

After the trip, set **`warmImageCacheOnLoad: false`** again for faster everyday startup.

## What works offline

| Works | Needs Wi‑Fi first |
|--------|-------------------|
| Math, My Pokédex, catch counts | Trip mode + image cache warmup |
| Pokémon names | Shipped in `data/dex.json` with the app |
| Sprites | Cached after warmup / scrolling |

Progress is stored only in **this browser on this phone** (`localStorage`). It does not transfer from your computer.

## If something breaks offline

- Open on Wi‑Fi again and repeat steps 2–5 with trip mode on.
- Do not clear Chrome site data for this URL (that wipes progress).

## Clear all cached data (optional)

In Chrome dev tools or a debug console on the game page:

```javascript
localStorage.removeItem("pokemonDex386_v1");
localStorage.removeItem("pokemonMathCollection_v1");
caches.delete("pokemon-math-v1");
```

Then refresh on Wi‑Fi.
