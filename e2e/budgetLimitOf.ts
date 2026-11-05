import { readFileSync } from "node:fs";
import { parse } from "yaml";
import { readBudgetEntries } from "../tools/harness-runner/readBudgetEntries";

export function budgetLimitOf(id: string): number {
  const entries = readBudgetEntries(parse(readFileSync("harness/budgets.yaml", "utf8")));
  const limit = Number(entries.find((entry) => entry.id === id)?.limit);
  if (Number.isNaN(limit)) {
    throw new Error(`no limit for budget ${id} in harness/budgets.yaml`);
  }
  return limit;
}
