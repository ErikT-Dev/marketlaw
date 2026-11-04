export type ReplayRecordStatement = {
  readonly bind: (...values: ReadonlyArray<string | number>) => ReplayRecordStatement;
  readonly run: () => Promise<unknown>;
  readonly first: (column: string) => Promise<unknown>;
};
