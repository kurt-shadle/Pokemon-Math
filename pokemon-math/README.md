# Pokemon Math Adventure

A simple browser math game for personal use. Each problem shows two Pokemon (with pictures) and their **national dex numbers**. Your child solves the numeric equation; Pokemon are the fun hook.

- Operations: addition, subtraction, multiplication, division
- **×** and **÷** use the **11 times table** (factors and answers up to 11×11)
- Correct answers show a big **success screen** with the Pokemon you found (name, sprite, number); tap **Next Problem** to continue
- Data and images from [PokeAPI](https://pokeapi.co/) (not Bulbapedia/Serebii)

## How to play

1. **Online:** [https://kurt-shadle.github.io/Pokemon-Math/](https://kurt-shadle.github.io/Pokemon-Math/) in Chrome (best on Android for phone use).
2. **Local:** open `index.html` in a browser (needs internet for the first load; `fetch` may fail if opened as `file://`).
3. First launch downloads Pokémon data and caches images (Wi‑Fi once). See [docs/OFFLINE.md](docs/OFFLINE.md) for car-trip / offline preload steps.
4. Pick **+ − × ÷**, solve the equation, press **Check**. Wrong answers let you try again; when correct, celebrate the Pokémon you found, then press **Next Problem**.

## Tune difficulty

Edit [js/settings.js](js/settings.js):

- `maxDex` — upper dex number for + and −
- `timesTableMax` — cap for × and ÷ (default 11)

## Clear cached Pokemon data

In the browser dev tools console (F12):

```javascript
localStorage.removeItem("pokemonDex386_v1");
```

Then refresh the page.

## Credits

- Pokemon data and sprites via [PokeAPI](https://pokeapi.co/)
- Pokemon names and characters are © Nintendo / Game Freak / The Pokémon Company. This project is unofficial fan use for education at home.
