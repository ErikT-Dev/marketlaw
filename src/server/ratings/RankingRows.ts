import type { RankingEntry } from "../../shared/api/RankingEntry";

export type RankingRows = {
  readonly page: number;
  readonly total: number;
  readonly rows: ReadonlyArray<RankingEntry>;
};
