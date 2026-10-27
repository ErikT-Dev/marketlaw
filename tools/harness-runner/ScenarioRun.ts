import type { Scenario } from "./Scenario.ts";
import type { ScenarioResult } from "./ScenarioResult.ts";

export type ScenarioRun = {
  readonly scenario: Scenario;
  readonly result: ScenarioResult;
  readonly isRequired: boolean;
};
