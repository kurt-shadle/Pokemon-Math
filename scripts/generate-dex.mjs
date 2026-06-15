/**
 * Regenerate pokemon-math/data/dex.json from PokeAPI.
 * Run: node scripts/generate-dex.mjs [maxDex]
 * Default maxDex: 550
 */
import { mkdirSync, writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const maxDex = Number(process.argv[2]) || 550;
const outPath = join(
  dirname(fileURLToPath(import.meta.url)),
  "..",
  "pokemon-math",
  "data",
  "dex.json"
);

async function fetchPage(offset, limit) {
  const res = await fetch(
    `https://pokeapi.co/api/v2/pokemon?limit=${limit}&offset=${offset}`
  );
  if (!res.ok) throw new Error(`PokeAPI list failed: ${res.status}`);
  return res.json();
}

const entries = [];
let offset = 0;
const pageSize = 100;

while (entries.length < maxDex) {
  const limit = Math.min(pageSize, maxDex - entries.length);
  const data = await fetchPage(offset, limit);
  for (const row of data.results) {
    const match = row.url.match(/\/pokemon\/(\d+)\/?$/);
    if (!match) continue;
    const id = Number(match[1]);
    if (id < 1 || id > maxDex) continue;
    entries.push({ id, name: row.name });
  }
  if (!data.next || entries.length >= maxDex) break;
  offset += limit;
}

entries.sort((a, b) => a.id - b.id);
const trimmed = entries.filter((e) => e.id >= 1 && e.id <= maxDex);

if (trimmed.length < maxDex) {
  console.warn(`Warning: expected ${maxDex} entries, got ${trimmed.length}`);
}

mkdirSync(dirname(outPath), { recursive: true });
writeFileSync(outPath, JSON.stringify(trimmed) + "\n");
console.log(`Wrote ${trimmed.length} entries to ${outPath}`);
