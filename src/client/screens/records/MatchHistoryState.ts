import type { HistoryCursor } from "../../../shared/api/HistoryCursor";
import type { MatchHistoryEntry } from "../../../shared/api/MatchHistoryEntry";
import type { OlderGamesStatus } from "./OlderGamesStatus";

export type MatchHistoryState =
  | { readonly kind: "loading" }
  | { readonly kind: "failed" }
  | { readonly kind: "account_gone" }
  | {
      readonly kind: "found";
      readonly username: string;
      readonly games: ReadonlyArray<MatchHistoryEntry>;
      readonly older: HistoryCursor | null;
      readonly olderGames: OlderGamesStatus;
    };
