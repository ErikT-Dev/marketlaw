import { describe, expect, it } from "vitest";
import { NO_GAMES } from "../simulator/NO_GAMES.ts";
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
  unhandledGivenValues: () => [],
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

async function judge(required: RequiredList): Promise<ReadonlyArray<string>> {
  const run: HarnessRun = {
    required,
    runs: await buildScenarioRuns(SCENARIO_FILES, required, [TURN_ONE_DRIVER]),
    invariantIds: [],
    budgetIds: [],
    cardDataProblems: [],
    tierShareProblems: [],
    replayExportProblems: [],
    simulation: NO_GAMES,
    busyDay: null,
    passwordHashCpuMs: null,
    simulatedInvariants: [],
  };
  return judgeHarness(run);
}

describe("buildScenarioRuns", () => {
  it("does not fail the check for a failing scenario that is not required", async () => {
    expect(await judge({ scenarios: [], invariants: [], budgets: [] })).toEqual([]);
  });

  it("fails the check for a failing scenario on the required list", async () => {
    const required = {
      scenarios: [{ file: "setup", name: "starts in turn 2" }],
      invariants: [],
      budgets: [],
    };
    expect(await judge(required)).toEqual([
      'required scenario "setup: starts in turn 2" fails: then.turn: expected 2, got 1',
    ]);
  });

  it("passes the check when the required scenario passes", async () => {
    const required = {
      scenarios: [{ file: "setup", name: "starts in turn 1" }],
      invariants: [],
      budgets: [],
    };
    expect(await judge(required)).toEqual([]);
  });
});
