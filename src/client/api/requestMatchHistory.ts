import * as v from "valibot";
import type { HistoryCursor } from "../../shared/api/HistoryCursor";
import { MatchHistoryResponse } from "../../shared/api/MatchHistoryResponse";
import type { PlayerId } from "../../shared/PlayerId";
import { getJson } from "./getJson";

function olderGamesQuery(before: HistoryCursor | null): string {
  if (before === null) {
    return "";
  }
  const query = new URLSearchParams({
    before_ms: String(before.endedAt),
    before_game: before.gameId,
  });
  return `?${query.toString()}`;
}

export async function requestMatchHistory(
  playerId: PlayerId,
  before: HistoryCursor | null,
): Promise<MatchHistoryResponse | null> {
  const parsed = v.safeParse(
    MatchHistoryResponse,
    await getJson(`/api/players/${playerId}/history${olderGamesQuery(before)}`),
  );
  return parsed.success ? parsed.output : null;
}
