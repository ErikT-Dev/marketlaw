import { awakeSecondsPerGame } from "./awakeSecondsPerGame.ts";
import type { HarnessRun } from "./HarnessRun.ts";
import { legalGameAverage } from "./legalGameAverage.ts";

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
    case "B4":
      return [legalGameAverage(run.simulation, "rowsWritten", 3)];
    case "B5":
      return [legalGameAverage(run.simulation, "rowsWritten", 4)];
    case "B9":
      return [legalGameAverage(run.simulation, "messages", 3)];
    case "B16":
      return [legalGameAverage(run.simulation, "rowsRead", 3)];
    case "B13":
      return [Math.ceil((run.simulation.largestMeasures["savedBytes"] ?? 0) / 1024)];
    case "B17":
      return [Math.ceil((run.simulation.largestMeasures["replayBytes"] ?? 0) / 1024)];
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
