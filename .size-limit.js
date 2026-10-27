import { readFileSync } from "node:fs";
import { parse } from "yaml";

const budgets = parse(readFileSync("harness/budgets.yaml", "utf8"));
const initialDownload = budgets.find((budget) => budget.id === "B14");

export default [
  {
    name: "initial download (B14)",
    path: ["dist/client/assets/*.js", "dist/client/assets/*.css"],
    limit: `${initialDownload.limit} kB`,
    gzip: true,
  },
];
