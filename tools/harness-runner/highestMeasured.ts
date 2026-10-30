import { awakeSecondsPerGame } from "./awakeSecondsPerGame.ts";
import type { HarnessRun } from "./HarnessRun.ts";

function simulated(run: HarnessRun, budget: string): ReadonlyArray<number> {
  if (run.simulation.games === 0) {
    return [];
  }
  switch (budget) {
    case "B1":
      return [run.simulation.mostRowsPerAcceptedAction];
    case "B2":
      return [run.simulation.mostRowsPerOtherMessage];
    case "B3":
      return [run.simulation.mostAlarmChangesOverAllowance];
    case "B12":
      return [awakeSecondsPerGame(run.simulation)];
    default:
      return [];
  }
}

export function highestMeasured(run: HarnessRun, budget: string): number | undefined {
  const values = [
    ...run.runs.flatMap(({ measurements }) =>
      measurements.filter((measurement) => measurement.budget === budget).map(({ value }) => value),
    ),
    ...simulated(run, budget),
  ];
  return values.length === 0 ? undefined : Math.max(...values);
}
