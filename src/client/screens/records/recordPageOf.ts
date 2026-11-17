import * as v from "valibot";
import { GameId } from "../../../shared/GameId";
import { PlayerId } from "../../../shared/PlayerId";
import { RANKING_HASH } from "./RANKING_HASH";
import type { RecordPage } from "./RecordPage";

const RECORD_PAGE_HASH = /^#(history|record)\/(.+)$/;

export function recordPageOf(hash: string): RecordPage | null {
  if (hash === RANKING_HASH) {
    return { kind: "ranking" };
  }
  const [, kind, id] = RECORD_PAGE_HASH.exec(hash) ?? [];
  if (kind === "history") {
    const playerId = v.safeParse(PlayerId, id);
    return playerId.success ? { kind, playerId: playerId.output } : null;
  }
  const gameId = v.safeParse(GameId, id);
  return kind === "record" && gameId.success ? { kind, gameId: gameId.output } : null;
}
