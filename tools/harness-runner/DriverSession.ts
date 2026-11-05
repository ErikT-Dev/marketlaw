import type { BudgetMeasurement } from "./BudgetMeasurement.ts";
import type { ScenarioStep } from "./ScenarioStep.ts";

export type DriverSession = {
  readonly runStep: (step: ScenarioStep) => void | Promise<void>;
  readonly readThen: (field: string, expected: unknown) => unknown;
  readonly measurements?: () => ReadonlyArray<BudgetMeasurement>;
};
