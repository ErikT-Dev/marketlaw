import type { BudgetMeasurement } from "./BudgetMeasurement.ts";
import type { ScenarioResult } from "./ScenarioResult.ts";

export type ScenarioOutcome = {
  readonly result: ScenarioResult;
  readonly measurements: ReadonlyArray<BudgetMeasurement>;
};
