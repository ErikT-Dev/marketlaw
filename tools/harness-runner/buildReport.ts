import { escapeHtml } from "./escapeHtml.ts";
import { highestMeasured } from "./highestMeasured.ts";
import type { IdentifiedEntry } from "./IdentifiedEntry.ts";
import { MEASURED_BUDGET_LIMITS } from "./MEASURED_BUDGET_LIMITS.ts";
import { REPORT_STYLE } from "./REPORT_STYLE.ts";
import type { ReportInput } from "./ReportInput.ts";
import { reportRules } from "./reportRules.ts";
import { reportStatusOf } from "./reportStatusOf.ts";
import { statusBadge } from "./statusBadge.ts";

const SCENARIO_STATUSES = ["passes", "fails", "passes, not yet required", "not yet"] as const;
const CHECKS_NOT_BUILT = [
  "Statistical check: tier shares over 100,000 simulated draws per turn (R17.10)",
  "Rating calculation check (A10)",
  "Replay export check (M4.2)",
];

function verdict({ problems }: ReportInput): string {
  const status = problems.length === 0 ? "passes" : "fails";
  const list = problems.map((problem) => `<li>${escapeHtml(problem)}</li>`).join("");
  return `<p class="verdict ${status}">The harness ${status}.</p>${list === "" ? "" : `<ul>${list}</ul>`}`;
}

function summary({ run }: ReportInput): string {
  const rows = SCENARIO_STATUSES.map((status) => {
    const count = run.runs.filter((scenarioRun) => reportStatusOf(scenarioRun) === status).length;
    return `<li>${statusBadge(status)}${count}</li>`;
  }).join("");
  return `<h2>Scenarios</h2><p>${run.runs.length} scenarios.</p><ul>${rows}</ul>`;
}

function checks({ run }: ReportInput): string {
  const cardStatus = run.cardDataProblems.length === 0 ? "passes" : "fails";
  const cardProblems = run.cardDataProblems
    .map((problem) => `<span class="detail">${escapeHtml(problem)}</span>`)
    .join("");
  const notBuilt = CHECKS_NOT_BUILT.map((check) => `<li>${statusBadge("not yet")}${check}</li>`);
  return `<h2>Checks</h2><ul><li>${statusBadge(cardStatus)}Card-data check (R3.1, R3.2, R3.5)${cardProblems}</li>${notBuilt.join("")}</ul>`;
}

function identifiedList(
  title: string,
  entries: ReadonlyArray<IdentifiedEntry>,
  required: ReadonlyArray<string>,
  problems: ReadonlyArray<string>,
): string {
  const items = entries
    .map(({ id, name }) => {
      const hasProblem = problems.some((problem) => problem.startsWith(`required ${id} `));
      const status = required.includes(id) ? (hasProblem ? "fails" : "passes") : "not yet";
      return `<li>${statusBadge(status)}${escapeHtml(`${id}: ${name}`)}</li>`;
    })
    .join("");
  return `<h2>${title}</h2><ul>${items}</ul>`;
}

function budgetList(input: ReportInput): string {
  const measured = input.budgets.map(({ id, name }) => {
    const value = highestMeasured(input.run.runs, id);
    const limit = MEASURED_BUDGET_LIMITS[id];
    return value === undefined || limit === undefined
      ? { id, name }
      : { id, name: `${name} (highest measured ${value}, limit ${limit})` };
  });
  return identifiedList("Budgets", measured, input.run.required.budgets, input.problems);
}

export function buildReport(input: ReportInput): string {
  return [
    "<!doctype html>",
    '<html lang="en"><head><meta charset="utf-8"><title>MarketLaw harness report</title>',
    `<style>${REPORT_STYLE}</style></head><body>`,
    "<h1>MarketLaw harness report</h1>",
    `<p>Generated ${escapeHtml(input.generatedAt)}.</p>`,
    verdict(input),
    summary(input),
    checks(input),
    "<h2>Rules</h2>",
    reportRules(input.ruleSpecs, input.run.runs, input.exceptions),
    identifiedList("Invariants", input.invariants, input.run.required.invariants, input.problems),
    budgetList(input),
    "</body></html>",
  ].join("\n");
}
