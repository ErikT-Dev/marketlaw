import * as v from "valibot";
import { GameRecordResponse } from "../../shared/api/GameRecordResponse";
import type { GameId } from "../../shared/GameId";
import { getJson } from "./getJson";

export async function requestGameRecord(gameId: GameId): Promise<GameRecordResponse | null> {
  const parsed = v.safeParse(GameRecordResponse, await getJson(`/api/records/${gameId}`));
  return parsed.success ? parsed.output : null;
}
