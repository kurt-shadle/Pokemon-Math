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

let pendingRestoreMode = "merge";

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
  img.alt = caught ? formatCollectionName(pokemon?.name) : "Not discovered";
  if (caught && pokemon) {
    setPokemonImage(img, pokemon);
  } else {
    img.classList.add("placeholder");
    img.removeAttribute("src");
  }

  const name = document.createElement("p");
  name.className = "collection-entry-name";
  name.textContent = caught
    ? formatCollectionName(pokemon?.name)
    : "???";

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

function formatCollectionName(name) {
  return name ? name.replace(/-/g, " ") : "???";
}

function renderCollectionGrid() {
  if (!collectionGrid || !collectionDexMap) return;

  const catches = getCatchesForOp(collectionViewOp);
  const { min, max } = getCollectionDexRange(collectionViewOp);
  collectionGrid.innerHTML = "";

  for (let id = min; id <= max; id++) {
    const count = catches[String(id)] || 0;
    const pokemon =
      collectionDexMap.get(id) ?? collectionDexMap.get(Number(id));
    collectionGrid.appendChild(buildCollectionEntry(id, count, pokemon));
  }

  updateCollectionChrome();
}

function setCollectionViewOp(op) {
  collectionViewOp = normalizeCollectionOp(op);
  syncCollectionOpButtons();
  renderCollectionGrid();
}

function openCollection(op) {
  if (!collectionModal) return;
  collectionViewOp = normalizeCollectionOp(op ?? getGameOperation());
  syncCollectionOpButtons();
  renderCollectionGrid();
  setCollectionBackupStatus("");
  collectionModal.classList.remove("hidden");
  document.body.classList.add("collection-open");
  closeCollectionBtn?.focus();
}

function closeCollection() {
  if (!collectionModal) return;
  collectionModal.classList.add("hidden");
  document.body.classList.remove("collection-open");
  openCollectionBtn?.focus();
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
    }
  });
}
