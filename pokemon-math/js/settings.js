/** Game limits — edit here to tune difficulty. */
const SETTINGS = {
  minDex: 1,
  maxDex: 151,
  /** × and ÷ use factors / answers from 1 through this (11 times table). */
  timesTableMax: 11,
  /** Pokemon peeking from the grass each problem (one is secretly the answer). */
  grassCount: 6,
  cacheKey: "pokemonDex386_v1",
  fetchBatchSize: 10,
};
