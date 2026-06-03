function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateAddition() {
  let left, right, answer;
  do {
    left = randomInt(SETTINGS.minDex, SETTINGS.maxDex);
    right = randomInt(SETTINGS.minDex, SETTINGS.maxDex - left);
    answer = left + right;
  } while (answer > SETTINGS.maxDex);
  return { op: "+", left, right, answer };
}

function generateSubtraction() {
  const left = randomInt(SETTINGS.minDex, SETTINGS.maxDex);
  const right = randomInt(SETTINGS.minDex, left);
  return { op: "-", left, right, answer: left - right };
}

/** Both factors are 1–11 (11 times table). */
function generateMultiplication() {
  const max = SETTINGS.timesTableMax;
  const left = randomInt(1, max);
  const right = randomInt(1, max);
  return { op: "×", left, right, answer: left * right };
}

/** Divisor and quotient are 1–11; exact division only. */
function generateDivision() {
  const max = SETTINGS.timesTableMax;
  const divisor = randomInt(1, max);
  const quotient = randomInt(1, max);
  const left = divisor * quotient;
  return { op: "÷", left, right: divisor, answer: quotient };
}

function generateProblem(op) {
  switch (op) {
    case "+":
      return generateAddition();
    case "-":
      return generateSubtraction();
    case "×":
      return generateMultiplication();
    case "÷":
      return generateDivision();
    default:
      return generateAddition();
  }
}

function formatEquation(op, left, right) {
  const symbol = op === "×" ? "×" : op === "÷" ? "÷" : op;
  return `${left} ${symbol} ${right} = ?`;
}
