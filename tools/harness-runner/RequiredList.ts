export type RequiredList = {
  readonly scenarios: ReadonlyArray<{ readonly file: string; readonly name: string }>;
  readonly invariants: ReadonlyArray<string>;
  readonly budgets: ReadonlyArray<string>;
};
