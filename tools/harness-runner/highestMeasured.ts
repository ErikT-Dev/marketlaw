import type { ScenarioRun } from "./ScenarioRun.ts";

export function highestMeasured(
  runs: ReadonlyArray<ScenarioRun>,
  budget: string,
): number | undefined {
  const values = runs.flatMap(({ measurements }) =>
    measurements.filter((measurement) => measurement.budget === budget).map(({ value }) => value),
  );
  return values.length === 0 ? undefined : Math.max(...values);
}
