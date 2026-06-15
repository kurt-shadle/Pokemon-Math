let collectionDexMap = null;
let collectionViewOp = "+";
let getGameOperation = () => "+";

const collectionModal = document.getElementById("collection-modal");
const collectionGrid = document.getElementById("collection-grid");
const collectionStatsEl = document.getElementById("collection-stats");
const collectionRangeEl = document.getElementById("collection-range");
const collectionOpButtons = document.querySelectorAll(".collection-op-btn");
const openCollectionBtn = document.getElementById("open-collection");
const closeCollectionBtn = document.getElementById("close-collection");
const collectionBadge = document.getElementById("collection-badge");
const collectionBackupBtn = document.getElementById("collection-backup-btn");
const collectionRestoreBtn = document.getElementById("collection-restore-btn");
const collectionReplaceBtn = document.getElementById("collection-replace-btn");
const collectionRestoreInput = document.getElementById("collection-restore-input");
const collectionBackupStatus = document.getElementById("collection-backup-status");

const backgroundInertTargets = [
  document.getElementById("app-header"),
  document.getElementById("loading-panel"),
  document.getElementById("game-panel"),
  document.getElementById("grass-meadow"),
].filter(Boolean);

let pendingRestoreMode = "merge";
let focusBeforeCollection = null;

function updateCollectionBadge(op) {
  if (!collectionBadge) return;
  const viewOp = op ?? collectionViewOp ?? getGameOperation();
  const { discovered } = getCollectionStats(viewOp);
  collectionBadge.textContent = String(discovered);
  collectionBadge.classList.toggle("hidden", discovered === 0);
}

function syncCollectionOpButtons() {
  for (const btn of collectionOpButtons) {
    const isActive = btn.dataset.op === collectionViewOp;
    btn.classList.toggle("active", isActive);
    btn.setAttribute("aria-pressed", String(isActive));
  }
}

function updateCollectionChrome() {
  const { discovered, totalCatches, opLabel } =
    getCollectionStats(collectionViewOp);
  const { min, max } = getCollectionDexRange(collectionViewOp);

  if (collectionStatsEl) {
    collectionStatsEl.textContent = `${opLabel} · ${discovered} discovered · ${totalCatches} total catches`;
  }
  if (collectionRangeEl) {
    const rangeLabel =
      collectionViewOp === "×" || collectionViewOp === "÷"
        ? `Answer numbers #${min} – #${max}`
        : `National Dex #${min} – #${max}`;
    collectionRangeEl.textContent = rangeLabel;
  }
}

function buildCollectionEntry(id, count, pokemon) {
  const caught = count > 0;
  const el = document.createElement("article");
  el.className = `collection-entry${caught ? " caught" : " empty"}`;

  const num = document.createElement("p");
  num.className = "collection-entry-num";
  num.textContent = `#${id}`;

  const img = document.createElement("img");
  img.width = 72;
  img.height = 72;
  img.alt = caught ? formatPokemonName(pokemon?.name) : "Not discovered";
  if (caught && pokemon) {
    setPokemonImage(img, pokemon);
  } else {
    img.classList.add("placeholder");
    img.removeAttribute("src");
  }

  const name = document.createElement("p");
  name.className = "collection-entry-name";
  name.textContent = caught ? formatPokemonName(pokemon?.name) : "???";

  el.append(num, img, name);

  if (caught) {
    const badge = document.createElement("span");
    badge.className = "collection-entry-count";
    badge.textContent = `×${count}`;
    badge.title = `Found ${count} time${count === 1 ? "" : "s"}`;
    el.appendChild(badge);
  }

  return el;
}

function renderCollectionGrid() {
  if (!collectionGrid || !collectionDexMap) return;

  const catches = getCatchesForOp(collectionViewOp);
  const { min, max } = getCollectionDexRange(collectionViewOp);
  const fragment = document.createDocumentFragment();

  for (let id = min; id <= max; id++) {
    const count = catches[String(id)] || 0;
    const pokemon = collectionDexMap.get(id);
    fragment.appendChild(buildCollectionEntry(id, count, pokemon));
  }

  collectionGrid.replaceChildren(fragment);
  updateCollectionChrome();
}

function setCollectionViewOp(op) {
  collectionViewOp = normalizeCollectionOp(op);
  syncCollectionOpButtons();
  renderCollectionGrid();
}

function getCollectionFocusable() {
  if (!collectionModal) return [];
  const dialog = collectionModal.querySelector(".collection-dialog");
  if (!dialog) return [];
  return [
    ...dialog.querySelectorAll(
      'button:not([disabled]), [href], input:not([type="file"]), select, textarea, [tabindex]:not([tabindex="-1"])'
    ),
  ].filter(
    (el) => !el.classList.contains("hidden") && el.offsetParent !== null
  );
}

function setBackgroundInert(inert) {
  for (const el of backgroundInertTargets) {
    if (inert) el.setAttribute("inert", "");
    else el.removeAttribute("inert");
  }
}

function handleCollectionTabTrap(e) {
  if (e.key !== "Tab" || collectionModal?.classList.contains("hidden")) return;

  const focusable = getCollectionFocusable();
  if (focusable.length === 0) return;

  const first = focusable[0];
  const last = focusable[focusable.length - 1];

  if (e.shiftKey && document.activeElement === first) {
    e.preventDefault();
    last.focus();
  } else if (!e.shiftKey && document.activeElement === last) {
    e.preventDefault();
    first.focus();
  }
}

function openCollection(op) {
  if (!collectionModal) return;
  collectionViewOp = normalizeCollectionOp(op ?? getGameOperation());
  syncCollectionOpButtons();
  renderCollectionGrid();
  setCollectionBackupStatus("");
  focusBeforeCollection = document.activeElement;
  collectionModal.classList.remove("hidden");
  document.body.classList.add("collection-open");
  setBackgroundInert(true);
  closeCollectionBtn?.focus();
}

function closeCollection() {
  if (!collectionModal) return;
  collectionModal.classList.add("hidden");
  document.body.classList.remove("collection-open");
  setBackgroundInert(false);
  if (focusBeforeCollection && typeof focusBeforeCollection.focus === "function") {
    focusBeforeCollection.focus();
  } else {
    openCollectionBtn?.focus();
  }
  focusBeforeCollection = null;
}

function setCollectionBackupStatus(message, isError = false) {
  if (!collectionBackupStatus) return;
  collectionBackupStatus.textContent = message;
  collectionBackupStatus.classList.toggle("error", isError);
}

function downloadCollectionBackup() {
  try {
    const payload = exportCollection();
    const json = JSON.stringify(payload, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = getCollectionBackupFilename();
    link.click();
    URL.revokeObjectURL(url);
    setCollectionBackupStatus("Backup downloaded — save it somewhere safe!");
  } catch (err) {
    setCollectionBackupStatus("Could not create backup.", true);
    console.error(err);
  }
}

function startCollectionRestore(mode) {
  pendingRestoreMode = mode;
  if (collectionRestoreInput) {
    collectionRestoreInput.value = "";
    collectionRestoreInput.click();
  }
}

async function handleCollectionRestoreFile(file) {
  if (!file) return;

  setCollectionBackupStatus("");

  if (
    pendingRestoreMode === "replace" &&
    !window.confirm(
      "Replace all Pokédex progress on this device with the backup? This cannot be undone."
    )
  ) {
    return;
  }

  try {
    const text = await file.text();
    const result = importCollection(text, { mode: pendingRestoreMode });

    renderCollectionGrid();
    updateCollectionBadge(getGameOperation());

    if (result.mode === "replace") {
      setCollectionBackupStatus(
        `Restored backup — ${result.discoveredAdded} Pokémon, ${result.totalCatchesAdded} total catches.`
      );
      return;
    }

    if (result.discoveredAdded === 0 && result.totalCatchesAdded === 0) {
      setCollectionBackupStatus("Backup loaded — nothing new to merge.");
      return;
    }

    setCollectionBackupStatus(
      `Merged backup — +${result.discoveredAdded} discovered, +${result.totalCatchesAdded} catches.`
    );
  } catch (err) {
    setCollectionBackupStatus(
      err instanceof Error ? err.message : "Could not read backup file.",
      true
    );
    console.error(err);
  }
}

function initCollectionUI(dexMap, getCurrentOp) {
  collectionDexMap = dexMap;
  if (typeof getCurrentOp === "function") getGameOperation = getCurrentOp;

  updateCollectionBadge(getGameOperation());

  openCollectionBtn?.addEventListener("click", () =>
    openCollection(getGameOperation())
  );
  closeCollectionBtn?.addEventListener("click", closeCollection);

  collectionBackupBtn?.addEventListener("click", downloadCollectionBackup);
  collectionRestoreBtn?.addEventListener("click", () =>
    startCollectionRestore("merge")
  );
  collectionReplaceBtn?.addEventListener("click", () =>
    startCollectionRestore("replace")
  );
  collectionRestoreInput?.addEventListener("change", () => {
    const file = collectionRestoreInput.files?.[0];
    void handleCollectionRestoreFile(file);
  });

  for (const btn of collectionOpButtons) {
    btn.addEventListener("click", () => setCollectionViewOp(btn.dataset.op));
  }

  collectionModal?.addEventListener("click", (e) => {
    if (e.target === collectionModal) closeCollection();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !collectionModal?.classList.contains("hidden")) {
      closeCollection();
      return;
    }
    handleCollectionTabTrap(e);
  });
}
