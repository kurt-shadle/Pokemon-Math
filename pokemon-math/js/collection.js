const COLLECTION_OPS = ["+", "-", "×", "÷"];

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
