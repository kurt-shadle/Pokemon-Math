function grassRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffleArray(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Pick dex ids for the meadow. One is always the answer (when in range).
 * Others are random decoys — not the two problem operands.
 */
function pickGrassDexIds(problem, dexMap) {
  const count = SETTINGS.grassCount ?? 5;
  const { minDex, maxDex } = SETTINGS;
  const answer = problem.answer;
  const exclude = new Set([problem.left, problem.right]);
  const ids = [];

  if (
    answer >= minDex &&
    answer <= maxDex &&
    dexMap.has(answer)
  ) {
    ids.push(answer);
  }

  let guard = 0;
  while (ids.length < count && guard < 500) {
    guard++;
    const id = grassRandomInt(minDex, maxDex);
    if (ids.includes(id) || exclude.has(id) || !dexMap.has(id)) continue;
    ids.push(id);
  }

  return shuffleArray(ids).slice(0, count);
}

const GRASS_SLOTS = [5, 20, 36, 52, 68, 84];
const GRASS_DESKTOP_MQ = window.matchMedia("(min-width: 500px)");

function isGrassSceneEnabled() {
  return GRASS_DESKTOP_MQ.matches;
}

function renderGrassScene(problem, dexMap) {
  const container = document.getElementById("grass-pokemon");
  if (!container || dexMap.size === 0) return;

  if (!isGrassSceneEnabled()) {
    container.innerHTML = "";
    return;
  }

  const ids = pickGrassDexIds(problem, dexMap);
  container.innerHTML = "";

  ids.forEach((id, i) => {
    const pokemon = dexMap.get(id);
    if (!pokemon) return;

    const mon = document.createElement("div");
    mon.className = "grass-mon";
    const slot = GRASS_SLOTS[i % GRASS_SLOTS.length];
    const jitter = (Math.random() - 0.5) * 5;
    mon.style.left = `calc(${slot + jitter}% - 36px)`;
    mon.style.animationDelay = `${i * 0.12}s`;
    mon.style.zIndex = String(10 + (i % 3));

    const img = document.createElement("img");
    img.alt = "";
    setPokemonImage(img, pokemon);
    mon.appendChild(img);
    container.appendChild(mon);
  });
}
