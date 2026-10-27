import type { BudgetMeasurement } from "./BudgetMeasurement.ts";
import type { Scenario } from "./Scenario.ts";
import type { ScenarioResult } from "./ScenarioResult.ts";

export type ScenarioRun = {
  readonly scenario: Scenario;
  readonly result: ScenarioResult;
  readonly isRequired: boolean;
  readonly measurements: ReadonlyArray<BudgetMeasurement>;
};
