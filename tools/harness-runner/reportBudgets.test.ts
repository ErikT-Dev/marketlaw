import { readFileSync } from "node:fs";
import { parse } from "yaml";
import { describe, expect, it } from "vitest";
import { HARNESS_PATHS } from "../harness-check/HARNESS_PATHS.ts";
import { NO_GAMES } from "../simulator/NO_GAMES.ts";
import { BUDGET_CHECKS } from "./BUDGET_CHECKS.ts";
import type { HarnessRun } from "./HarnessRun.ts";
import { MEASURED_BUDGET_LIMITS } from "./MEASURED_BUDGET_LIMITS.ts";
import { readBudgetEntries } from "./readBudgetEntries.ts";
import { reportBudgets } from "./reportBudgets.ts";

const BUDGETS = readBudgetEntries(parse(readFileSync(HARNESS_PATHS.budgets, "utf8")));

const RUN: HarnessRun = {
  required: { scenarios: [], invariants: [], budgets: ["B18"] },
  runs: [],
  invariantIds: [],
  budgetIds: BUDGETS.map(({ id }) => id),
  cardDataProblems: [],
  tierShareProblems: [],
  replayExportProblems: [],
  simulation: NO_GAMES,
  busyDay: { written: { room: 10, alarm: 20, lobby: 30, database: 40 }, rowsRead: 500 },
  simulatedInvariants: [],
};

function itemOf(report: string, id: string): string {
  return report.split("<li>").find((item) => item.includes(`${id}: `)) ?? "";
}

describe("the budget report", () => {
  it("knows how every budget in budgets.yaml is checked", () => {
    expect(BUDGETS.map(({ id }) => id).filter((id) => BUDGET_CHECKS[id] === undefined)).toEqual([]);
  });

  it("has a measured limit for every budget the harness measures", () => {
    const harnessChecked = Object.entries(BUDGET_CHECKS)
      .filter(([, check]) => check.by === "harness")
      .map(([id]) => id);
    expect(harnessChecked.filter((id) => MEASURED_BUDGET_LIMITS[id] === undefined)).toEqual([]);
  });

  it("lists a measured budget with its limit, its measurement and where it is measured", () => {
    const item = itemOf(reportBudgets(RUN, BUDGETS, []), "B18");
    expect(item).toContain("passes");
    expect(item).toContain("limit: 5000 (rows written, Durable Object and D1");
    expect(item).toContain("measured: 100, by busy-day simulator");
  });

  it("lists a required budget over its limit as failing", () => {
    const item = itemOf(reportBudgets(RUN, BUDGETS, ["required B18 measured 9000"]), "B18");
    expect(item).toContain('<span class="status fails">fails</span>');
  });

  it("names the check outside the harness for a budget measured elsewhere", () => {
    const item = itemOf(reportBudgets(RUN, BUDGETS, []), "B14");
    expect(item).toContain('<span class="status other-check">other check</span>');
    expect(item).toContain("checked by: size-limit");
  });

  it("names the phase that builds the feature of a budget not measured yet", () => {
    const item = itemOf(reportBudgets(RUN, BUDGETS, []), "B6");
    expect(item).toContain('<span class="status not-yet">not yet</span>');
    expect(item).toContain("checked by: phase 29, the tutorial");
  });
});
