import type { HistoryCursor } from "../../shared/api/HistoryCursor";
import type { KeptGameRecord } from "./KeptGameRecord";

export type MatchHistoryPage = {
  readonly games: ReadonlyArray<KeptGameRecord>;
  readonly older: HistoryCursor | null;
};
