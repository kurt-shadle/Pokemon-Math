const COLLECTION_OPS = ["+", "-", "×", "÷"];
const COLLECTION_EXPORT_VERSION = 1;

const COLLECTION_OP_LABELS = {
  "+": "Addition",
  "-": "Subtraction",
  "×": "Multiplication",
  "÷": "Division",
};

function normalizeCollectionOp(op) {
  return COLLECTION_OPS.includes(op) ? op : "+";
}

function emptyCatchesByOp() {
  const catches = {};
  for (const op of COLLECTION_OPS) catches[op] = {};
  return catches;
}

function defaultCollectionData() {
  return { catches: emptyCatchesByOp() };
}

function isLegacyFlatCatches(catches) {
  if (!catches || typeof catches !== "object") return false;
  return !COLLECTION_OPS.some((op) => op in catches);
}

function migrateCollection(raw) {
  if (!raw || typeof raw !== "object") return defaultCollectionData();

  const catches = raw.catches;
  if (!catches || typeof catches !== "object") return defaultCollectionData();

  if (isLegacyFlatCatches(catches)) {
    const migrated = emptyCatchesByOp();
    migrated["+"] = { ...catches };
    return { catches: migrated };
  }

  const migrated = emptyCatchesByOp();
  for (const op of COLLECTION_OPS) {
    if (catches[op] && typeof catches[op] === "object") {
      migrated[op] = { ...catches[op] };
    }
  }
  return { catches: migrated };
}

function loadCollection() {
  try {
    const raw = localStorage.getItem(SETTINGS.collectionKey);
    if (!raw) return defaultCollectionData();
    return migrateCollection(JSON.parse(raw));
  } catch {
    return defaultCollectionData();
  }
}

function saveCollection(data) {
  localStorage.setItem(
    SETTINGS.collectionKey,
    JSON.stringify({ catches: data.catches })
  );
}

function getCatchesForOp(op) {
  const data = loadCollection();
  return data.catches[normalizeCollectionOp(op)] || {};
}

/** Max answer # shown in the grid for this operation's Pokédex. */
function getCollectionDexRange(op) {
  const min = SETTINGS.minDex;
  const opKey = normalizeCollectionOp(op);
  if (opKey === "×" || opKey === "÷") {
    const max = SETTINGS.timesTableMax * SETTINGS.timesTableMax;
    return { min, max };
  }
  return { min, max: SETTINGS.maxDex };
}

function getCollectionOpLabel(op) {
  return COLLECTION_OP_LABELS[normalizeCollectionOp(op)] || "Addition";
}

/** Increment catch count for a dex number in this operation's Pokédex. */
function recordCatch(dexId, op) {
  const id = Number(dexId);
  if (!Number.isFinite(id) || id < SETTINGS.minDex) return 0;

  const opKey = normalizeCollectionOp(op);
  const data = loadCollection();
  const key = String(id);
  const bucket = data.catches[opKey];
  const next = (bucket[key] || 0) + 1;
  bucket[key] = next;
  saveCollection(data);
  return next;
}

function getCatchCount(dexId, op) {
  const key = String(Number(dexId));
  return getCatchesForOp(op)[key] || 0;
}

function getCollectionStats(op) {
  const catches = getCatchesForOp(op);
  const ids = Object.keys(catches);
  let totalCatches = 0;
  for (const id of ids) totalCatches += catches[id];
  return {
    discovered: ids.length,
    totalCatches,
    opLabel: getCollectionOpLabel(op),
  };
}

function getCollectionBackupFilename() {
  const date = new Date().toISOString().slice(0, 10);
  return `pokemon-math-pokedex-${date}.json`;
}

function exportCollection() {
  const data = loadCollection();
  return {
    version: COLLECTION_EXPORT_VERSION,
    exportedAt: new Date().toISOString(),
    catches: data.catches,
  };
}

function parseCollectionImport(raw) {
  let parsed = raw;
  if (typeof raw === "string") {
    try {
      parsed = JSON.parse(raw);
    } catch {
      throw new Error("Backup file is not valid JSON.");
    }
  }
  if (!parsed || typeof parsed !== "object") {
    throw new Error("Backup file is not a valid Pokédex backup.");
  }
  return migrateCollection(parsed);
}

function mergeCatchesByOp(target, source) {
  let discoveredAdded = 0;
  let totalCatchesAdded = 0;

  for (const op of COLLECTION_OPS) {
    const src = source[op] || {};
    const bucket = target[op];
    for (const [id, count] of Object.entries(src)) {
      const n = Number(count);
      if (!Number.isFinite(n) || n <= 0) continue;
      const prev = bucket[id] || 0;
      if (prev === 0) discoveredAdded++;
      totalCatchesAdded += n;
      bucket[id] = prev + n;
    }
  }

  return { discoveredAdded, totalCatchesAdded };
}

function getAllCollectionStats(data) {
  let discovered = 0;
  let totalCatches = 0;
  for (const op of COLLECTION_OPS) {
    const stats = getCollectionStatsForData(data, op);
    discovered += stats.discovered;
    totalCatches += stats.totalCatches;
  }
  return { discovered, totalCatches };
}

function getCollectionStatsForData(data, op) {
  const catches = data.catches[normalizeCollectionOp(op)] || {};
  const ids = Object.keys(catches);
  let totalCatches = 0;
  for (const id of ids) totalCatches += catches[id];
  return { discovered: ids.length, totalCatches };
}

/**
 * @param {object|string} raw - Parsed backup or JSON string
 * @param {{ mode?: 'merge' | 'replace' }} options
 */
function importCollection(raw, options = {}) {
  const mode = options.mode === "replace" ? "replace" : "merge";
  const imported = parseCollectionImport(raw);

  if (mode === "replace") {
    saveCollection(imported);
    const stats = getAllCollectionStats(imported);
    return {
      mode,
      ...stats,
      discoveredAdded: stats.discovered,
      totalCatchesAdded: stats.totalCatches,
    };
  }

  const current = loadCollection();
  const { discoveredAdded, totalCatchesAdded } = mergeCatchesByOp(
    current.catches,
    imported.catches
  );
  saveCollection(current);
  return { mode, discoveredAdded, totalCatchesAdded };
}
