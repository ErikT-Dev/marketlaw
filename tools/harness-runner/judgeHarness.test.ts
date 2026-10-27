import { describe, expect, it } from "vitest";
import type { HarnessRun } from "./HarnessRun.ts";
import type { RequiredList } from "./RequiredList.ts";
import type { ScenarioResult } from "./ScenarioResult.ts";
import type { ScenarioRun } from "./ScenarioRun.ts";
import { judgeHarness } from "./judgeHarness.ts";

const NOTHING_REQUIRED: RequiredList = { scenarios: [], invariants: [], budgets: [] };

function runOf(name: string, result: ScenarioResult, isRequired: boolean): ScenarioRun {
  return {
    scenario: {
      file: "setup",
      number: 1,
      name,
      covers: ["R1.1"],
      given: {},
      random: [],
      when: [],
      then: {},
    },
    result,
    isRequired,
    measurements: [],
  };
}

function harnessRun(parts: Partial<HarnessRun>): HarnessRun {
  return {
    required: NOTHING_REQUIRED,
    runs: [],
    invariantIds: ["I1"],
    budgetIds: ["B1"],
    cardDataProblems: [],
    ...parts,
  };
}

describe("judgeHarness", () => {
  it("passes when nothing is required", () => {
    const run = harnessRun({
      runs: [
        runOf(
          "deals hands",
          { status: "fails", problems: ["then.turn: expected 2, got 1"] },
          false,
        ),
      ],
    });
    expect(judgeHarness(run)).toEqual([]);
  });

  it("fails the check when a required scenario fails", () => {
    const run = harnessRun({
      required: { ...NOTHING_REQUIRED, scenarios: [{ file: "setup", name: "deals hands" }] },
      runs: [
        runOf("deals hands", { status: "fails", problems: ["then.turn: expected 2, got 1"] }, true),
      ],
    });
    expect(judgeHarness(run)).toEqual([
      'required scenario "setup: deals hands" fails: then.turn: expected 2, got 1',
    ]);
  });

  it("fails the check when a required scenario cannot run yet", () => {
    const run = harnessRun({
      required: { ...NOTHING_REQUIRED, scenarios: [{ file: "setup", name: "deals hands" }] },
      runs: [runOf("deals hands", { status: "not_yet", missing: ["a driver"] }, true)],
    });
    expect(judgeHarness(run)).toEqual([
      'required scenario "setup: deals hands" cannot run yet: a driver',
    ]);
  });

  it("passes when every required scenario passes", () => {
    const run = harnessRun({
      required: { ...NOTHING_REQUIRED, scenarios: [{ file: "setup", name: "deals hands" }] },
      runs: [runOf("deals hands", { status: "passes" }, true)],
    });
    expect(judgeHarness(run)).toEqual([]);
  });

  it("fails the check on an unknown name on the required list", () => {
    const run = harnessRun({
      required: {
        scenarios: [{ file: "setup", name: "a scenario nobody wrote" }],
        invariants: ["I99"],
        budgets: ["B99"],
      },
    });
    expect(judgeHarness(run)).toEqual([
      'required scenario "setup: a scenario nobody wrote" does not exist',
      "required invariant I99 does not exist",
      "required budget B99 does not exist",
    ]);
  });

  it("fails the check on a required invariant or budget that has no check yet", () => {
    const run = harnessRun({ required: { scenarios: [], invariants: ["I1"], budgets: ["B1"] } });
    expect(judgeHarness(run)).toEqual([
      "required I1 has no check yet",
      "required B1 has no check yet",
    ]);
  });

  it("fails the check when the card data has problems", () => {
    const run = harnessRun({ cardDataProblems: ["239 cards, not 240"] });
    expect(judgeHarness(run)).toEqual(["card-data check: 239 cards, not 240"]);
  });
});
