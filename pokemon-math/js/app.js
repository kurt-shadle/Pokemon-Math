let dex = new Map();
let currentOp = "+";
let currentProblem = null;
let solved = false;

const loadingPanel = document.getElementById("loading-panel");
const loadingText = document.getElementById("loading-text");
const loadingFill = document.getElementById("loading-fill");
const gamePanel = document.getElementById("game-panel");
const gameActive = document.getElementById("game-active");
const problemArea = document.getElementById("problem-area");

const imgLeft = document.getElementById("img-left");
const imgRight = document.getElementById("img-right");
const nameLeft = document.getElementById("name-left");
const nameRight = document.getElementById("name-right");
const numLeft = document.getElementById("num-left");
const numRight = document.getElementById("num-right");
const opDisplay = document.getElementById("op-display");
const equationEl = document.getElementById("equation");

const answerForm = document.getElementById("answer-form");
const answerInput = document.getElementById("answer-input");
const checkBtn = document.getElementById("check-btn");
const feedbackEl = document.getElementById("feedback");

const successPanel = document.getElementById("success-panel");
const successEquation = document.getElementById("success-equation");
const imgResult = document.getElementById("img-result");
const nameResult = document.getElementById("name-result");
const numResult = document.getElementById("num-result");
const nextBtn = document.getElementById("next-btn");

const opButtons = document.querySelectorAll(".op-btn");

function showGameView() {
  solved = false;
  if (gameActive) gameActive.classList.remove("hidden");
  if (successPanel) successPanel.classList.add("hidden");
}

function showSuccessView() {
  solved = true;
  if (gameActive) gameActive.classList.add("hidden");
  if (successPanel) successPanel.classList.remove("hidden");
}

function showLoading(show) {
  loadingPanel.classList.toggle("hidden", !show);
  gamePanel.classList.toggle("hidden", show);
}

function formatPokemonName(name) {
  return name ? name.replace(/-/g, " ") : "???";
}

function fillCard(id, imgEl, nameEl, numEl) {
  const pokemon = dex.get(id) ?? dex.get(Number(id));
  setPokemonImage(imgEl, pokemon);
  nameEl.textContent = formatPokemonName(pokemon?.name);
  numEl.textContent = `#${id}`;
}

function formatSolvedEquation(problem) {
  const symbol =
    problem.op === "×" ? "×" : problem.op === "÷" ? "÷" : problem.op;
  return `${problem.left} ${symbol} ${problem.right} = ${problem.answer}`;
}

function isEnterKey(e) {
  return (
    e.key === "Enter" ||
    e.code === "Enter" ||
    e.code === "NumpadEnter" ||
    e.keyCode === 13
  );
}

function parseAnswerInput(raw) {
  const trimmed = raw.trim();
  if (trimmed === "" || !/^\d+$/.test(trimmed)) return null;
  return parseInt(trimmed, 10);
}

function showSuccessPanel(problem) {
  if (!successPanel) return;

  const answer = problem.answer;
  const pokemon = dex.get(answer) ?? dex.get(Number(answer));

  if (successEquation) {
    successEquation.textContent = formatSolvedEquation(problem);
  }

  if (pokemon) {
    imgResult.classList.remove("placeholder");
    setPokemonImage(imgResult, pokemon);
    nameResult.textContent = formatPokemonName(pokemon.name);
  } else {
    imgResult.classList.add("placeholder");
    imgResult.removeAttribute("src");
    imgResult.alt = "";
    nameResult.textContent = "Unknown Pokemon";
  }
  numResult.textContent = `#${answer}`;

  showSuccessView();
  nextBtn?.focus();
}

function renderProblem(problem) {
  currentProblem = problem;
  if (problemArea) problemArea.classList.remove("shake");

  fillCard(problem.left, imgLeft, nameLeft, numLeft);
  fillCard(problem.right, imgRight, nameRight, numRight);

  const symbol =
    problem.op === "×" ? "×" : problem.op === "÷" ? "÷" : problem.op;
  opDisplay.textContent = symbol;
  equationEl.textContent = formatEquation(
    problem.op,
    problem.left,
    problem.right
  );

  answerInput.value = "";
  answerInput.disabled = false;
  feedbackEl.textContent = "";
  feedbackEl.className = "feedback";
  checkBtn.disabled = false;

  for (const btn of opButtons) btn.disabled = false;
  renderGrassScene(problem, dex);
  answerInput.focus();
}

function newProblem() {
  showGameView();
  renderProblem(generateProblem(currentOp));
}

function onCheck() {
  if (!currentProblem || solved) return;

  const value = parseAnswerInput(answerInput.value);
  if (value === null) {
    feedbackEl.textContent = "Enter a whole number!";
    feedbackEl.className = "feedback wrong";
    return;
  }

  if (value === currentProblem.answer) {
    feedbackEl.textContent = "";
    feedbackEl.className = "feedback";
    if (problemArea) {
      problemArea.classList.remove("shake");
    }
    showSuccessPanel(currentProblem);
  } else {
    feedbackEl.textContent = "Not quite — try again!";
    feedbackEl.className = "feedback wrong";
    if (problemArea) {
      problemArea.classList.remove("shake");
      void problemArea.offsetWidth;
      problemArea.classList.add("shake");
    }
    answerInput.focus();
    answerInput.select();
  }
}

function setOperation(op) {
  if (solved) return;
  currentOp = op;
  for (const btn of opButtons) {
    const isActive = btn.dataset.op === op;
    btn.classList.toggle("active", isActive);
    btn.setAttribute("aria-pressed", String(isActive));
  }
  newProblem();
}

async function init() {
  if (!gameActive || !successPanel) {
    console.error("Game markup is missing required elements.");
    return;
  }

  showLoading(true);
  checkBtn.disabled = true;
  answerInput.disabled = true;

  try {
    dex = await loadPokemonData((done, total) => {
      const pct = Math.round((done / total) * 100);
      loadingText.textContent = `Loading Pokemon... ${done} / ${total}`;
      loadingFill.style.width = `${pct}%`;
    });
  } catch (err) {
    loadingText.textContent =
      "Could not load Pokemon. Check your internet and refresh the page.";
    console.error(err);
    return;
  }

  showLoading(false);
  checkBtn.disabled = false;
  answerInput.disabled = false;
  showGameView();
  renderProblem(generateProblem(currentOp));
}

for (const btn of opButtons) {
  btn.addEventListener("click", () => setOperation(btn.dataset.op));
}

function handleAnswerSubmit(e) {
  e.preventDefault();
  onCheck();
}

if (answerForm) {
  answerForm.addEventListener("submit", handleAnswerSubmit);
} else {
  checkBtn.addEventListener("click", onCheck);
}

document.addEventListener("keydown", (e) => {
  if (!isEnterKey(e) || !solved) return;
  e.preventDefault();
  newProblem();
});

nextBtn.addEventListener("click", newProblem);

init();
