# Offline / car trip setup (Android)

The game needs **one full preload on the phone** over Wi‑Fi before you go. Copying files to the phone does not work reliably.

## Live link (use this on the phone)

After GitHub Pages is enabled:

**https://kurt-shadle.github.io/Pokemon-Math/**

(Repo: [kurt-shadle/Pokemon-Math](https://github.com/kurt-shadle/Pokemon-Math) → **Settings → Pages** → source: **GitHub Actions**.)

## Before you leave (Wi‑Fi required)

Do all of this **on the Android phone** he will use in the car (not on your PC).

1. Open the link above in **Chrome**.
2. Wait until loading finishes (e.g. **151 / 151** at default settings).
3. Wait for **Caching images…** to finish if shown.
4. Solve a few problems in **each** mode: **+**, **−**, **×**, **÷** (saves My Pokédex progress on this device).
5. Open **My Pokédex** → switch each tab → **scroll the full grid slowly** so sprites load.
6. Chrome menu → **Add to Home screen** (or **Install app**).
7. **Airplane mode verification (required):**
   - Turn Wi‑Fi off (or airplane mode on).
   - Open the game from the **home screen** shortcut (not a new tab).
   - [ ] A new math problem loads (+/−/×/÷).
   - [ ] Pokémon **pictures** show on the problem cards.
   - [ ] **My Pokédex** opens and previously caught Pokémon still show with counts.
   - If any box fails: Wi‑Fi on → open app → wait for **Caching images…** → scroll all four Pokédex tabs → repeat step 7.

## What works offline

| Works | Needs Wi‑Fi first |
|--------|-------------------|
| Math, My Pokédex, catch counts | Initial load + image cache warmup |
| Pokémon names (saved in browser) | First download |
| Sprites | Cached after warmup / scrolling |

Progress is stored only in **this browser on this phone** (`localStorage`). It does not transfer from your computer.

## If something breaks offline

- Open on Wi‑Fi again and repeat steps 2–5.
- Do not clear Chrome site data for this URL (that wipes progress).

## Clear all cached data (optional)

In Chrome dev tools or a debug console on the game page:

```javascript
localStorage.removeItem("pokemonDex386_v1");
localStorage.removeItem("pokemonMathCollection_v1");
caches.delete("pokemon-math-v1");
```

Then refresh on Wi‑Fi.
