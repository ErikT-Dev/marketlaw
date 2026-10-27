import { describe, expect, it } from "vitest";
import type { HarnessRun } from "./HarnessRun.ts";
import type { RequiredList } from "./RequiredList.ts";
import type { ScenarioDriver } from "./ScenarioDriver.ts";
import { buildScenarioRuns } from "./buildScenarioRuns.ts";
import { judgeHarness } from "./judgeHarness.ts";

const SCENARIO_FILES = [
  {
    path: "harness/scenarios/setup.yaml",
    scenarios: [
      { name: "starts in turn 1", covers: ["R1.4"], then: { turn: 1 } },
      { name: "starts in turn 2", covers: ["R1.4"], then: { turn: 2 } },
    ],
  },
];

const TURN_ONE_DRIVER: ScenarioDriver = {
  name: "turn one",
  givenFields: new Set(),
  steps: new Set(),
  thenFields: new Set(["turn"]),
  nestedFields: new Map(),
  startSession() {
    return {
      runStep() {
        return undefined;
      },
      readThen() {
        return 1;
      },
    };
  },
};

function judge(required: RequiredList): ReadonlyArray<string> {
  const run: HarnessRun = {
    required,
    runs: buildScenarioRuns(SCENARIO_FILES, required, [TURN_ONE_DRIVER]),
    invariantIds: [],
    budgetIds: [],
    cardDataProblems: [],
  };
  return judgeHarness(run);
}

describe("buildScenarioRuns", () => {
  it("does not fail the check for a failing scenario that is not required", () => {
    expect(judge({ scenarios: [], invariants: [], budgets: [] })).toEqual([]);
  });

  it("fails the check for a failing scenario on the required list", () => {
    const required = {
      scenarios: [{ file: "setup", name: "starts in turn 2" }],
      invariants: [],
      budgets: [],
    };
    expect(judge(required)).toEqual([
      'required scenario "setup: starts in turn 2" fails: then.turn: expected 2, got 1',
    ]);
  });

  it("passes the check when the required scenario passes", () => {
    const required = {
      scenarios: [{ file: "setup", name: "starts in turn 1" }],
      invariants: [],
      budgets: [],
    };
    expect(judge(required)).toEqual([]);
  });
});
