import type { RequiredScenario } from "./RequiredScenario.ts";

export type RequiredList = {
  readonly scenarios: ReadonlyArray<RequiredScenario>;
  readonly invariants: ReadonlyArray<string>;
  readonly budgets: ReadonlyArray<string>;
};
