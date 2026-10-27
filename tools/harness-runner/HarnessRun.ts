import type { RequiredList } from "./RequiredList.ts";
import type { ScenarioRun } from "./ScenarioRun.ts";

export type HarnessRun = {
  readonly required: RequiredList;
  readonly runs: ReadonlyArray<ScenarioRun>;
  readonly invariantIds: ReadonlyArray<string>;
  readonly budgetIds: ReadonlyArray<string>;
  readonly cardDataProblems: ReadonlyArray<string>;
};
