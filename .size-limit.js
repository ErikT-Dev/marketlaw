import { readFileSync } from "node:fs";
import { parse } from "yaml";

const budgets = parse(readFileSync("harness/budgets.yaml", "utf8"));
const initialDownload = budgets.find((budget) => budget.id === "B14");
const manifest = JSON.parse(readFileSync("dist/client/.vite/manifest.json", "utf8"));

function firstScreenFiles(key, found = new Set()) {
  const chunk = manifest[key];
  if (found.has(chunk.file)) {
    return found;
  }
  found.add(chunk.file);
  for (const css of chunk.css ?? []) {
    found.add(css);
  }
  for (const imported of chunk.imports ?? []) {
    firstScreenFiles(imported, found);
  }
  return found;
}

const entry = Object.keys(manifest).find((key) => manifest[key].isEntry);

export default [
  {
    name: "initial download (B14)",
    path: [...firstScreenFiles(entry)].map((file) => `dist/client/${file}`),
    limit: `${initialDownload.limit} kB`,
    gzip: true,
  },
];
