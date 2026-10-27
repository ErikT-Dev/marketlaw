import type { ScenarioFile } from "./ScenarioFile.ts";

export type HarnessFiles = {
  readonly scenarioFiles: ReadonlyArray<ScenarioFile>;
  readonly ruleSpecs: ReadonlyArray<{ readonly path: string; readonly text: string }>;
  readonly gameRulesText: string;
  readonly harnessText: string;
  readonly rulebookText: string;
  readonly cards: ReadonlyArray<unknown>;
  readonly scenarioFormat: unknown;
  readonly coverageExceptions: unknown;
};
