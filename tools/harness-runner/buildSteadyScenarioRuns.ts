import type { ScenarioFile } from "../harness-check/ScenarioFile.ts";
import type { BudgetMeasurement } from "./BudgetMeasurement.ts";
import { buildScenarioRuns } from "./buildScenarioRuns.ts";
import type { RequiredList } from "./RequiredList.ts";
import type { ScenarioDriver } from "./ScenarioDriver.ts";
import type { ScenarioRun } from "./ScenarioRun.ts";

const COMPUTING_TIME_BUDGET = "B11";
const COMPUTING_TIME_ROUNDS = 3;

function computingTimesOf(run: ScenarioRun | undefined): ReadonlyArray<number> {
  return (run?.measurements ?? [])
    .filter(({ budget }) => budget === COMPUTING_TIME_BUDGET)
    .map(({ value }) => value);
}

function keepFastestComputingTimes(
  run: ScenarioRun,
  laterTimes: ReadonlyArray<ReadonlyArray<number>>,
): ScenarioRun {
  let computingTimeIndex = 0;
  const measurements = run.measurements.map((measurement): BudgetMeasurement => {
    if (measurement.budget !== COMPUTING_TIME_BUDGET) {
      return measurement;
    }
    const index = computingTimeIndex;
    computingTimeIndex += 1;
    const sameMessageTimes = laterTimes.map((times) => times[index] ?? measurement.value);
    return { budget: measurement.budget, value: Math.min(measurement.value, ...sameMessageTimes) };
  });
  return { ...run, measurements };
}

export async function buildSteadyScenarioRuns(
  scenarioFiles: ReadonlyArray<ScenarioFile>,
  required: RequiredList,
  drivers: ReadonlyArray<ScenarioDriver>,
): Promise<ReadonlyArray<ScenarioRun>> {
  const firstRound = await buildScenarioRuns(scenarioFiles, required, drivers);
  const laterRounds: Array<ReadonlyArray<ScenarioRun>> = [];
  for (let round = 1; round < COMPUTING_TIME_ROUNDS; round += 1) {
    laterRounds.push(await buildScenarioRuns(scenarioFiles, required, drivers));
  }
  return firstRound.map((run, runIndex) =>
    keepFastestComputingTimes(
      run,
      laterRounds.map((round) => computingTimesOf(round[runIndex])),
    ),
  );
}
