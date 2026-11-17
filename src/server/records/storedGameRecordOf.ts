import { gameRecordOf } from "../../rules/gameRecordOf";
import type { RoomGame } from "../room/RoomGame";
import { recordPlayersOf } from "./recordPlayersOf";
import type { StoredGameRecord } from "./StoredGameRecord";

export function storedGameRecordOf(game: RoomGame): StoredGameRecord | null {
  const record = gameRecordOf(game.saved);
  return record === null
    ? null
    : {
        ...record,
        kind: game.kind,
        startedMs: game.saved.setup.startedAt,
        endedMs: game.saved.state.clockStartedAt,
        players: recordPlayersOf(game, record.seats),
      };
}
