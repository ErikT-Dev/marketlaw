export type UsernameChange = {
  readonly currentName: string;
  readonly wantedName: string;
  readonly changesMs: ReadonlyArray<number>;
  readonly now: number;
};
