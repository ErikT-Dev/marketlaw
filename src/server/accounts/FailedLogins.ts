export type FailedLogins = {
  readonly timesMs: ReadonlyArray<number>;
  readonly humanCheckUntilMs: number | null;
};
