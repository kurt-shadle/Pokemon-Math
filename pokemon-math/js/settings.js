/** Game limits — edit here to tune difficulty. */
const SETTINGS = {
  minDex: 1,
  maxDex: 550,
  /** × and ÷ use factors / answers from 1 through this (11 times table). */
  timesTableMax: 11,
  /** Pokemon peeking from the grass each problem (one is secretly the answer). */
  grassCount: 6,
  /** Set true before a car trip to preload all sprites into Cache API (slower startup). */
  warmImageCacheOnLoad: false,
  dexJsonPath: "data/dex.json",
  cacheKey: "pokemonDex550_v2",
  collectionKey: "pokemonMathCollection_v1",
};
