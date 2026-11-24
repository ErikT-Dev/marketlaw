import type { LastTurnRow } from "./LastTurnRow";

export type LastTurnBox = {
  readonly title: string;
  readonly iconFile: string | null;
  readonly rows: ReadonlyArray<LastTurnRow>;
};
