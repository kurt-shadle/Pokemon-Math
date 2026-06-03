# Pokemon Math Adventure — game guide

## How to play

1. Open **[https://kurt-shadle.github.io/Pokemon-Math/](https://kurt-shadle.github.io/Pokemon-Math/)** (or run locally—see root [README](../README.md)).
2. Wait for **Loading Pokemon…** then **Caching images…** (first visit needs Wi‑Fi).
3. Choose **+ − × ÷**.
4. Use the two Pokémon **dex numbers** and the operator to solve the equation, type your answer, tap **Check**.
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

## Grass meadow

Six Pokémon peek from the grass at the bottom of the screen. One of them always matches the correct answer—a fun hint for observant players.

## Tune difficulty

Edit [js/settings.js](js/settings.js):

| Setting | Default | Effect |
|---------|---------|--------|
| `minDex` | `1` | Lowest dex number used |
| `maxDex` | `151` | Highest dex for **+ / −** and size of addition/subtraction Pokédex grid. **Changing this requires a page refresh** to reload Pokémon data. |
| `timesTableMax` | `11` | Factors and quotients for **× / ÷** (11× table) |
| `grassCount` | `6` | Pokémon visible in the meadow |

After changing `maxDex`, refresh on Wi‑Fi so the app downloads any new species and updates the collection grid.

## Offline / phone

See **[docs/OFFLINE.md](docs/OFFLINE.md)** for the car-trip preload and airplane-mode checklist.

- Use the **HTTPS** GitHub Pages link on the phone—not a downloaded zip.
- Preload must happen **on that phone**; progress does not transfer from a computer.

## Mobile

The UI uses large tap targets (~44px), safe-area padding for notched screens, a grid layout for problem cards on narrow widths, and smooth scrolling in the collection modal. Add to Home screen in Chrome for the best phone experience.

## Clear saved data

In the browser console on the game page:

```javascript
localStorage.removeItem("pokemonDex386_v1");
localStorage.removeItem("pokemonMathCollection_v1");
caches.delete("pokemon-math-v1");
```

Refresh on Wi‑Fi to rebuild caches.

## Tech notes

- No build step—plain HTML, CSS, and JavaScript.
- First load fetches species from [PokeAPI](https://pokeapi.co/); sprites are stored in the **Cache API** for offline display.
- Collection state: `pokemonMathCollection_v1` in `localStorage` (per-operation catch counts).

## Credits

- Data and sprites via [PokeAPI](https://pokeapi.co/)
- Pokémon names and characters © Nintendo / Game Freak / The Pokémon Company. Unofficial fan use for education at home.
