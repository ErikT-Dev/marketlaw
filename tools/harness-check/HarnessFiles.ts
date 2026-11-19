import type { RuleSpecText } from "./RuleSpecText.ts";
import type { ScenarioFile } from "./ScenarioFile.ts";

export type HarnessFiles = {
  readonly scenarioFiles: ReadonlyArray<ScenarioFile>;
  readonly ruleSpecs: ReadonlyArray<RuleSpecText>;
  readonly questsText: string;
  readonly influenceActionsText: string;
  readonly harnessText: string;
  readonly rulebookText: string;
  readonly cards: ReadonlyArray<unknown>;
  readonly scenarioFormat: unknown;
  readonly coverageExceptions: unknown;
  readonly invariants: unknown;
  readonly budgets: unknown;
};
