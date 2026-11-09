export type UsernameChange = {
  readonly currentName: string;
  readonly wantedName: string;
  readonly changedMs: number | null;
  readonly now: number;
};
