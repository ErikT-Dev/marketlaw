import type { RandomEntry } from "./RandomEntry.ts";
import type { ScenarioStep } from "./ScenarioStep.ts";

export type Scenario = {
  readonly file: string;
  readonly number: number;
  readonly name: string;
  readonly covers: ReadonlyArray<string>;
  readonly given: Readonly<Record<string, unknown>>;
  readonly random: ReadonlyArray<RandomEntry>;
  readonly when: ReadonlyArray<ScenarioStep>;
  readonly then: Readonly<Record<string, unknown>>;
};
