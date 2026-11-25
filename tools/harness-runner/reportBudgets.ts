import { BUDGET_CHECKS } from "./BUDGET_CHECKS.ts";
import { computingTimeOf } from "./computingTimeOf.ts";
import type { BudgetEntry } from "./BudgetEntry.ts";
import { escapeHtml } from "./escapeHtml.ts";
import type { HarnessRun } from "./HarnessRun.ts";
import { highestMeasured } from "./highestMeasured.ts";
import { statusBadge } from "./statusBadge.ts";

function statusOf(run: HarnessRun, { id }: BudgetEntry, problems: ReadonlyArray<string>): string {
  if (BUDGET_CHECKS[id]?.by === "other check") {
    return "other check";
  }
  if (run.required.budgets.includes(id)) {
    return problems.some((problem) => problem.startsWith(`required ${id} `)) ? "fails" : "passes";
  }
  return "not yet";
}

function detail(text: string): string {
  return `<span class="detail">${escapeHtml(text)}</span>`;
}

function measuredHalves(run: HarnessRun, id: string): string {
  if (id !== "B11") {
    return "";
  }
  const { roomMessagesMs, passwordHashMs } = computingTimeOf(run);
  return ` (room messages: ${String(roomMessagesMs ?? "not measured")}, password hash: ${String(passwordHashMs ?? "not measured")})`;
}

function budgetItem(run: HarnessRun, budget: BudgetEntry, problems: ReadonlyArray<string>): string {
  const value = highestMeasured(run, budget.id);
  const where = BUDGET_CHECKS[budget.id]?.where ?? "no check yet";
  const details = [
    detail(`limit: ${budget.limit} (${budget.unit})`),
    detail(
      value === undefined
        ? `checked by: ${where}`
        : `measured: ${String(value)}${measuredHalves(run, budget.id)}, by ${where}`,
    ),
  ].join("");
  return `<li>${statusBadge(statusOf(run, budget, problems))}${escapeHtml(`${budget.id}: ${budget.name}`)}${details}</li>`;
}

export function reportBudgets(
  run: HarnessRun,
  budgets: ReadonlyArray<BudgetEntry>,
  problems: ReadonlyArray<string>,
): string {
  const items = budgets.map((budget) => budgetItem(run, budget, problems)).join("");
  return `<h2>Budgets</h2><ul>${items}</ul>`;
}
