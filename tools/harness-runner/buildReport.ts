import { escapeHtml } from "./escapeHtml.ts";
import type { IdentifiedEntry } from "./IdentifiedEntry.ts";
import { REPORT_STYLE } from "./REPORT_STYLE.ts";
import type { ReportInput } from "./ReportInput.ts";
import { reportBudgets } from "./reportBudgets.ts";
import { reportRules } from "./reportRules.ts";
import { reportGameLength } from "./reportGameLength.ts";
import { reportSimulation } from "./reportSimulation.ts";
import { reportStatusOf } from "./reportStatusOf.ts";
import { statusBadge } from "./statusBadge.ts";

const SCENARIO_STATUSES = ["passes", "fails", "passes, not yet required", "not yet"] as const;
const CHECKS_NOT_BUILT = ["Rating calculation check (A10)"];

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

function checkItem(title: string, problems: ReadonlyArray<string>): string {
  const status = problems.length === 0 ? "passes" : "fails";
  const details = problems
    .map((problem) => `<span class="detail">${escapeHtml(problem)}</span>`)
    .join("");
  return `<li>${statusBadge(status)}${title}${details}</li>`;
}

function checks({ run }: ReportInput): string {
  const notBuilt = CHECKS_NOT_BUILT.map((check) => `<li>${statusBadge("not yet")}${check}</li>`);
  const built = [
    checkItem("Card-data check (R3.1, R3.2, R3.5)", run.cardDataProblems),
    checkItem(
      "Statistical check: tier shares over 100,000 simulated draws per turn (R17.10)",
      run.tierShareProblems,
    ),
    checkItem(
      "Replay export check: a running and an ended room are exported and replay exactly (M4.2)",
      run.replayExportProblems,
    ),
  ];
  return `<h2>Checks</h2><ul>${[...built, ...notBuilt].join("")}</ul>`;
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
    reportSimulation(input.run.simulation, input.run.simulatedInvariants),
    reportGameLength(input.run.simulation),
    "<h2>Rules</h2>",
    reportRules(input.ruleSpecs, input.run.runs, input.exceptions),
    identifiedList("Invariants", input.invariants, input.run.required.invariants, input.problems),
    reportBudgets(input.run, input.budgets, input.problems),
    "</body></html>",
  ].join("\n");
}
