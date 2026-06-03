const ARTWORK_URL = (id) =>
  `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;

const SPRITE_URL = (id) =>
  `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`;

async function fetchOnePokemon(id) {
  try {
    const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
    if (!res.ok) {
      return { id, name: `pokemon-${id}`, imageUrl: ARTWORK_URL(id) };
    }
    const data = await res.json();
    const imageUrl =
      data.sprites?.other?.["official-artwork"]?.front_default ||
      data.sprites?.front_default ||
      ARTWORK_URL(id);
    return { id: data.id, name: data.name, imageUrl };
  } catch {
    return { id, name: `pokemon-${id}`, imageUrl: ARTWORK_URL(id) };
  }
}

function loadPokemonFromCache() {
  try {
    const raw = localStorage.getItem(SETTINGS.cacheKey);
    if (!raw) return null;
    const arr = JSON.parse(raw);
    const expected = SETTINGS.maxDex - SETTINGS.minDex + 1;
    if (!Array.isArray(arr) || arr.length < expected) return null;
    const map = new Map();
    for (const entry of arr) map.set(Number(entry.id), entry);
    return map;
  } catch {
    return null;
  }
}

function savePokemonToCache(map) {
  const arr = [...map.values()].sort((a, b) => a.id - b.id);
  localStorage.setItem(SETTINGS.cacheKey, JSON.stringify(arr));
}

async function loadPokemonData(onProgress) {
  const cached = loadPokemonFromCache();
  if (cached) {
    onProgress?.(cached.size, cached.size);
    return cached;
  }

  const map = new Map();
  const ids = [];
  for (let i = SETTINGS.minDex; i <= SETTINGS.maxDex; i++) ids.push(i);

  let done = 0;
  for (let i = 0; i < ids.length; i += SETTINGS.fetchBatchSize) {
    const batch = ids.slice(i, i + SETTINGS.fetchBatchSize);
    const entries = await Promise.all(batch.map(fetchOnePokemon));
    for (const entry of entries) map.set(Number(entry.id), entry);
    done += batch.length;
    onProgress?.(done, ids.length);
  }

  savePokemonToCache(map);
  return map;
}

/** Fetch any dex ids missing from the map up to SETTINGS.maxDex. */
async function ensureDexLoaded(map, onProgress) {
  const target = SETTINGS.maxDex;

  const missing = [];
  for (let i = SETTINGS.minDex; i <= target; i++) {
    if (!map.has(i)) missing.push(i);
  }
  if (!missing.length) return map;

  let done = 0;
  const total = missing.length;
  for (let i = 0; i < missing.length; i += SETTINGS.fetchBatchSize) {
    const batch = missing.slice(i, i + SETTINGS.fetchBatchSize);
    const entries = await Promise.all(batch.map(fetchOnePokemon));
    for (const entry of entries) map.set(Number(entry.id), entry);
    done += batch.length;
    onProgress?.(done, total);
  }

  savePokemonToCache(map);
  return map;
}

function setPokemonImage(img, pokemon) {
  if (!pokemon) {
    img.removeAttribute("src");
    img.alt = "Unknown Pokemon";
    img.classList.add("placeholder");
    return;
  }
  img.classList.remove("placeholder");
  img.alt = pokemon.name;
  const fallback = SPRITE_URL(pokemon.id);
  img.onerror = function onImgError() {
    if (img.src !== fallback) {
      img.src = fallback;
    } else {
      img.classList.add("placeholder");
    }
  };
  img.src = pokemon.imageUrl;
}
