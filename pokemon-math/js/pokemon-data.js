const IMAGE_CACHE_NAME = "pokemon-math-v1";

const ARTWORK_URL = (id) =>
  `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;

const SPRITE_URL = (id) =>
  `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`;

const blobUrlByImg = new WeakMap();

function revokeBlobUrlForImg(img) {
  const prev = blobUrlByImg.get(img);
  if (prev) {
    URL.revokeObjectURL(prev);
    blobUrlByImg.delete(img);
  }
}

function urlsForPokemon(pokemon) {
  const urls = [pokemon.imageUrl, SPRITE_URL(pokemon.id)];
  return [...new Set(urls.filter(Boolean))];
}

function entryFromDexRow(row) {
  const id = Number(row.id);
  return {
    id,
    name: row.name,
    imageUrl: ARTWORK_URL(id),
  };
}

async function cacheUrl(cache, url) {
  try {
    const res = await fetch(url, { mode: "cors" });
    if (res.ok) await cache.put(url, res);
  } catch {
    try {
      await cache.add(url);
    } catch {
      /* skip unreachable urls */
    }
  }
}

/** Store sprites in Cache API so they work offline after one online visit (HTTPS). */
async function warmImageCache(map, onProgress) {
  if (!("caches" in window)) return;

  const cache = await caches.open(IMAGE_CACHE_NAME);
  const urls = new Set();
  for (const pokemon of map.values()) {
    for (const url of urlsForPokemon(pokemon)) urls.add(url);
  }

  const list = [...urls];
  let done = 0;
  for (const url of list) {
    const existing = await cache.match(url);
    if (!existing) await cacheUrl(cache, url);
    done++;
    onProgress?.(done, list.length);
  }
}

async function applyCachedImage(img, url) {
  if (!url || !("caches" in window)) return false;
  const cached = await caches.match(url);
  if (!cached) return false;
  revokeBlobUrlForImg(img);
  const blobUrl = URL.createObjectURL(await cached.blob());
  blobUrlByImg.set(img, blobUrl);
  img.src = blobUrl;
  return true;
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

async function fetchDexJson() {
  const path = SETTINGS.dexJsonPath || "data/dex.json";
  const res = await fetch(path);
  if (!res.ok) throw new Error(`Could not load ${path}: ${res.status}`);
  const data = await res.json();
  if (!Array.isArray(data)) throw new Error("dex.json must be an array");
  return data;
}

function buildDexMap(rows) {
  const map = new Map();
  const { minDex, maxDex } = SETTINGS;
  for (const row of rows) {
    const id = Number(row.id);
    if (id < minDex || id > maxDex) continue;
    map.set(id, entryFromDexRow(row));
  }
  return map;
}

async function loadPokemonData(onProgress) {
  const cached = loadPokemonFromCache();
  if (cached) {
    onProgress?.(cached.size, cached.size);
    return cached;
  }

  const rows = await fetchDexJson();
  const map = buildDexMap(rows);
  const expected = SETTINGS.maxDex - SETTINGS.minDex + 1;
  if (map.size < expected) {
    throw new Error(
      `dex.json has ${map.size} entries for #${SETTINGS.minDex}–#${SETTINGS.maxDex}; run scripts/generate-dex.mjs`
    );
  }

  onProgress?.(map.size, map.size);
  savePokemonToCache(map);
  return map;
}

async function applyPokemonImage(img, pokemon) {
  if (!pokemon) {
    revokeBlobUrlForImg(img);
    img.removeAttribute("src");
    img.alt = "Unknown Pokemon";
    img.classList.add("placeholder");
    return;
  }

  img.classList.remove("placeholder");
  img.alt = pokemon.name;
  const primary = pokemon.imageUrl;
  const fallback = SPRITE_URL(pokemon.id);

  img.onerror = function onImgError() {
    if (img.dataset.fallbackTried === "1") {
      img.classList.add("placeholder");
      return;
    }
    img.dataset.fallbackTried = "1";
    void (async () => {
      if (await applyCachedImage(img, fallback)) return;
      revokeBlobUrlForImg(img);
      img.src = fallback;
    })();
  };

  img.dataset.fallbackTried = "0";
  if (await applyCachedImage(img, primary)) return;
  revokeBlobUrlForImg(img);
  img.src = primary;
}

function setPokemonImage(img, pokemon) {
  void applyPokemonImage(img, pokemon);
}
