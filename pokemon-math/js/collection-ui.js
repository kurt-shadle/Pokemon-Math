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

function initCollectionUI(dexMap, getCurrentOp) {
  collectionDexMap = dexMap;
  if (typeof getCurrentOp === "function") getGameOperation = getCurrentOp;

  updateCollectionBadge(getGameOperation());

  openCollectionBtn?.addEventListener("click", () =>
    openCollection(getGameOperation())
  );
  closeCollectionBtn?.addEventListener("click", closeCollection);

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
