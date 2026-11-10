import { describe, expect, it } from "vitest";
import type { BudgetMeasurement } from "./BudgetMeasurement.ts";
import { buildSteadyScenarioRuns } from "./buildSteadyScenarioRuns.ts";
import type { ScenarioDriver } from "./ScenarioDriver.ts";

const SCENARIO_FILES = [
  {
    path: "harness/scenarios/setup.yaml",
    scenarios: [{ name: "starts in turn 1", covers: ["R1.4"], then: { turn: 1 } }],
  },
];

const NOTHING_REQUIRED = { scenarios: [], invariants: [], budgets: [] };

function driverMeasuringRounds(
  rounds: ReadonlyArray<ReadonlyArray<BudgetMeasurement>>,
): ScenarioDriver {
  let roundsStarted = 0;
  return {
    name: "measuring",
    givenFields: new Set(),
    steps: new Set(),
    thenFields: new Set(["turn"]),
    nestedFields: new Map(),
    unhandledGivenValues: () => [],
    startSession() {
      const measurements = rounds[roundsStarted] ?? [];
      roundsStarted += 1;
      return {
        runStep() {
          return undefined;
        },
        readThen() {
          return 1;
        },
        measurements: () => measurements,
      };
    },
  };
}

function computingTime(value: number): BudgetMeasurement {
  return { budget: "B11", value };
}

describe("buildSteadyScenarioRuns", () => {
  it("keeps the fastest of three rounds for each message's computing time", async () => {
    const driver = driverMeasuringRounds([
      [computingTime(12), computingTime(1)],
      [computingTime(2), computingTime(9)],
      [computingTime(3), computingTime(1.5)],
    ]);
    const runs = await buildSteadyScenarioRuns(SCENARIO_FILES, NOTHING_REQUIRED, [driver]);
    expect(runs[0]?.measurements).toEqual([computingTime(2), computingTime(1)]);
  });

  it("keeps a message that is slow in every round slow", async () => {
    const driver = driverMeasuringRounds([
      [computingTime(14)],
      [computingTime(11)],
      [computingTime(13)],
    ]);
    const runs = await buildSteadyScenarioRuns(SCENARIO_FILES, NOTHING_REQUIRED, [driver]);
    expect(runs[0]?.measurements).toEqual([computingTime(11)]);
  });

  it("keeps the first round's other measurements and result", async () => {
    const rowsWritten = { budget: "B4", value: 7 };
    const driver = driverMeasuringRounds([
      [rowsWritten, computingTime(5)],
      [{ budget: "B4", value: 1 }, computingTime(4)],
      [{ budget: "B4", value: 1 }, computingTime(6)],
    ]);
    const runs = await buildSteadyScenarioRuns(SCENARIO_FILES, NOTHING_REQUIRED, [driver]);
    expect(runs[0]?.measurements).toEqual([rowsWritten, computingTime(4)]);
    expect(runs[0]?.result).toEqual({ status: "passes" });
  });
});
