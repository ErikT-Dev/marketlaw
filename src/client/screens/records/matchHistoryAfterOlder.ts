import type { MatchHistoryResponse } from "../../../shared/api/MatchHistoryResponse";
import type { MatchHistoryState } from "./MatchHistoryState";

export function matchHistoryAfterOlder(
  shown: MatchHistoryState,
  answer: MatchHistoryResponse | null,
): MatchHistoryState {
  if (shown.kind !== "found") {
    return shown;
  }
  if (answer?.kind !== "found") {
    return { ...shown, olderGames: "failed" };
  }
  return {
    ...shown,
    games: [...shown.games, ...answer.games],
    older: answer.older,
    olderGames: "idle",
  };
}
