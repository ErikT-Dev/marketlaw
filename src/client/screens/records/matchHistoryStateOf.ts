import type { MatchHistoryResponse } from "../../../shared/api/MatchHistoryResponse";
import type { MatchHistoryState } from "./MatchHistoryState";

export function matchHistoryStateOf(answer: MatchHistoryResponse | null): MatchHistoryState {
  if (answer === null) {
    return { kind: "failed" };
  }
  return answer.kind === "found" ? { ...answer, olderGames: "idle" } : answer;
}
