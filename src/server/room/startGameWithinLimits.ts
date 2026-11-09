import type { PlayerId } from "../../shared/PlayerId";
import type { PlayerOverLimit } from "../lobby/PlayerOverLimit";
import type { GameStart } from "./GameStart";
import type { RoomActionChange } from "./RoomActionChange";
import type { RoomRecord } from "./RoomRecord";
import { roomWithout } from "./roomWithout";
import { startRoomGame } from "./startRoomGame";

function withoutAsking(record: RoomRecord): RoomRecord {
  return { ...record, waiting: { ...record.waiting, asking: null } };
}

function rematchOverLimit(
  record: RoomRecord,
  players: ReadonlyArray<PlayerOverLimit>,
  accepter: PlayerId,
): RoomActionChange {
  return {
    record: withoutAsking(record),
    removals: [],
    notices: players.map(({ playerId, reason }) => ({
      playerId,
      notice: { kind: "daily_limit", reason },
    })),
    refusal: players.find(({ playerId }) => playerId === accepter)?.reason ?? null,
  };
}

export function startGameWithinLimits(
  record: RoomRecord,
  start: GameStart,
  accepter: PlayerId,
): RoomActionChange {
  const playerIds = record.players.map(({ playerId }) => playerId);
  const rejection = start.limitRejectionFor(playerIds);
  if (rejection === null) {
    return { record: startRoomGame(record, start), removals: [], notices: [], refusal: null };
  }
  if (rejection.kind === "no_answer") {
    return { record, removals: [], notices: [], refusal: "no_answer" };
  }
  if (rejection.kind === "site_game_limit") {
    return {
      record: withoutAsking(record),
      removals: [],
      notices: playerIds.map((playerId) => ({ playerId, notice: { kind: "site_game_limit" } })),
      refusal: "site_game_limit",
    };
  }
  if (record.game !== null) {
    return rematchOverLimit(record, rejection.players, accepter);
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
