export type RecordReadStatement = {
  readonly bind: (...values: ReadonlyArray<string | number>) => RecordReadStatement;
  readonly all: () => Promise<{ readonly results: ReadonlyArray<unknown> }>;
};
