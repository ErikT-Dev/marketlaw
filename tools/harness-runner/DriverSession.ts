import type { ScenarioStep } from "./ScenarioStep.ts";

export type DriverSession = {
  readonly runStep: (step: ScenarioStep) => void;
  readonly readThen: (field: string, expected: unknown) => unknown;
};
