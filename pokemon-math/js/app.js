let dex = new Map();
let currentOp = "+";
let currentProblem = null;
let solved = false;

const loadingPanel = document.getElementById("loading-panel");
const loadingText = document.getElementById("loading-text");
const loadingFill = document.getElementById("loading-fill");
const loadingProgressBar = document.querySelector("#loading-panel .progress-bar");
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
const mathProblem = document.getElementById("math-problem");
const mathTop = document.getElementById("math-top");
const mathOp = document.getElementById("math-op");
const mathBottom = document.getElementById("math-bottom");
const mathResult = document.getElementById("math-result");

const answerForm = document.getElementById("answer-form");
const answerInput = document.getElementById("answer-input");
const checkBtn = document.getElementById("check-btn");
const feedbackEl = document.getElementById("feedback");

const successPanel = document.getElementById("success-panel");
const successEquation = document.getElementById("success-equation");
const imgResult = document.getElementById("img-result");
const nameResult = document.getElementById("name-result");
const numResult = document.getElementById("num-result");
const successCatchCount = document.getElementById("success-catch-count");
const nextBtn = document.getElementById("next-btn");

const opButtons = document.querySelectorAll("#game-active .op-btn");

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
  loadingPanel.setAttribute("aria-busy", String(show));
}

function updateLoadingProgress(done, total, label) {
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;
  loadingText.textContent = `${label} ${done} / ${total}`;
  loadingFill.style.width = `${pct}%`;
  if (loadingProgressBar) {
    loadingProgressBar.setAttribute("aria-valuenow", String(pct));
  }
}

function fillCard(id, imgEl, nameEl, numEl) {
  const pokemon = dex.get(id);
  setPokemonImage(imgEl, pokemon);
  nameEl.textContent = formatPokemonName(pokemon?.name);
  numEl.textContent = `#${id}`;
}

function isEnterKey(e) {
  return e.key === "Enter" || e.code === "Enter" || e.code === "NumpadEnter";
}

function parseAnswerInput(raw) {
  const digits = raw.replace(/\D/g, "");
  if (digits === "") return null;
  return parseInt(digits, 10);
}

function sanitizeAnswerField() {
  if (!answerInput) return;
  const digits = answerInput.value.replace(/\D/g, "");
  if (answerInput.value !== digits) {
    answerInput.value = digits;
  }
}

function showSuccessPanel(problem) {
  if (!successPanel) return;

  const answer = problem.answer;
  const pokemon = dex.get(answer);

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

  const op = currentProblem.op ?? currentOp;
  const timesFound = recordCatch(answer, op);
  updateCollectionBadge(op);
  const opLabel = getCollectionOpLabel(op);
  if (successCatchCount) {
    if (timesFound > 0) {
      successCatchCount.classList.remove("hidden");
      successCatchCount.textContent =
        timesFound === 1
          ? `First time in your ${opLabel} Pokédex!`
          : `${opLabel} Pokédex: found ${timesFound} times!`;
    } else {
      successCatchCount.classList.add("hidden");
      successCatchCount.textContent = "";
    }
  }

  showSuccessView();
  nextBtn?.focus();
}

function renderProblem(problem) {
  currentProblem = problem;
  if (problemArea) problemArea.classList.remove("shake");

  fillCard(problem.left, imgLeft, nameLeft, numLeft);
  fillCard(problem.right, imgRight, nameRight, numRight);

  const symbol = formatOpSymbol(problem.op);
  opDisplay.textContent = symbol;
  if (mathTop) mathTop.textContent = String(problem.left);
  if (mathOp) mathOp.textContent = symbol;
  if (mathBottom) mathBottom.textContent = String(problem.right);
  if (mathResult) mathResult.textContent = "?";
  if (mathProblem) {
    mathProblem.setAttribute(
      "aria-label",
      formatEquation(problem.op, problem.left, problem.right)
    );
  }

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
  updateCollectionBadge(op);
  newProblem();
}

async function requestPersistentStorage() {
  if (!navigator.storage?.persist) return;
  try {
    if (navigator.storage.persisted && (await navigator.storage.persisted())) {
      return;
    }
    await navigator.storage.persist();
  } catch {
    /* browser may deny; backup file is the real safety net */
  }
}

async function init() {
  if (!gameActive || !successPanel) {
    console.error("Game markup is missing required elements.");
    return;
  }

  void requestPersistentStorage();

  showLoading(true);
  checkBtn.disabled = true;
  answerInput.disabled = true;

  try {
    dex = await loadPokemonData((done, total) => {
      updateLoadingProgress(done, total, "Loading Pokemon...");
    });

    if (SETTINGS.warmImageCacheOnLoad) {
      await warmImageCache(dex, (done, total) => {
        updateLoadingProgress(done, total, "Caching images...");
      });
    }
  } catch (err) {
    loadingText.textContent =
      "Could not load Pokemon. Check your internet and refresh the page.";
    console.error(err);
    return;
  }

  showLoading(false);
  checkBtn.disabled = false;
  answerInput.disabled = false;
  answerInput.maxLength = String(SETTINGS.maxDex).length + 1;
  initCollectionUI(dex, () => currentOp);
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

if (answerInput) {
  answerInput.addEventListener("input", sanitizeAnswerField);
  answerInput.addEventListener("paste", (e) => {
    e.preventDefault();
    const pasted = (e.clipboardData?.getData("text") || "").replace(/\D/g, "");
    if (!pasted) return;
    const start = answerInput.selectionStart ?? answerInput.value.length;
    const end = answerInput.selectionEnd ?? answerInput.value.length;
    const combined = (
      answerInput.value.slice(0, start) +
      pasted +
      answerInput.value.slice(end)
    ).replace(/\D/g, "");
    answerInput.value = combined.slice(0, answerInput.maxLength);
    sanitizeAnswerField();
  });
}

answerForm.addEventListener("submit", handleAnswerSubmit);

document.addEventListener("keydown", (e) => {
  if (!isEnterKey(e) || !solved) return;
  e.preventDefault();
  newProblem();
});

nextBtn.addEventListener("click", newProblem);

init();
