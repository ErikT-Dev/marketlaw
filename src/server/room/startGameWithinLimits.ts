import type { GameStart } from "./GameStart";
import type { RoomActionChange } from "./RoomActionChange";
import type { RoomRecord } from "./RoomRecord";
import { roomWithout } from "./roomWithout";
import { startRoomGame } from "./startRoomGame";

export function startGameWithinLimits(record: RoomRecord, start: GameStart): RoomActionChange {
  const playerIds = record.players.map(({ playerId }) => playerId);
  const rejection = start.limitRejectionFor(playerIds);
  if (rejection === null) {
    return { record: startRoomGame(record, start), removals: [], notices: [], refusal: null };
  }
  if (rejection.kind === "site_game_limit") {
    return {
      record: { ...record, waiting: { ...record.waiting, asking: null } },
      removals: [],
      notices: playerIds.map((playerId) => ({ playerId, notice: { kind: "site_game_limit" } })),
      refusal: "site_game_limit",
    };
  }
  return {
    record: roomWithout(
      record,
      rejection.players.map(({ playerId }) => playerId),
    ),
    removals: rejection.players.map(({ playerId, reason }) => ({
      playerId,
      reason,
      rejoinAt: null,
    })),
    notices: [],
    refusal: null,
  };
}
