/** Stack notation: larger operand on top (left). */
function withLargerOnTop(left, right) {
  return left < right ? [right, left] : [left, right];
}

function generateAddition() {
  let left, right, answer;
  do {
    left = randomInt(SETTINGS.minDex, SETTINGS.maxDex);
    right = randomInt(SETTINGS.minDex, SETTINGS.maxDex - left);
    answer = left + right;
  } while (answer > SETTINGS.maxDex);
  [left, right] = withLargerOnTop(left, right);
  return { op: "+", left, right, answer };
}

function generateSubtraction() {
  let left, right, answer;
  do {
    left = randomInt(SETTINGS.minDex, SETTINGS.maxDex);
    right = randomInt(SETTINGS.minDex, left);
    answer = left - right;
  } while (answer < SETTINGS.minDex);
  return { op: "-", left, right, answer };
}

/** Both factors are 1–11 (11 times table). */
function generateMultiplication() {
  const max = SETTINGS.timesTableMax;
  let left = randomInt(1, max);
  let right = randomInt(1, max);
  [left, right] = withLargerOnTop(left, right);
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
