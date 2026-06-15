function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function formatPokemonName(name) {
  return name ? name.replace(/-/g, " ") : "???";
}

function formatOpSymbol(op) {
  return op === "×" ? "×" : op === "÷" ? "÷" : op;
}

function formatEquation(op, left, right) {
  const symbol = formatOpSymbol(op);
  return `${left} ${symbol} ${right} = ?`;
}

function formatSolvedEquation(problem) {
  const symbol = formatOpSymbol(problem.op);
  return `${problem.left} ${symbol} ${problem.right} = ${problem.answer}`;
}
