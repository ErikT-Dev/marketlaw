import { viewFor } from "../../rules/viewFor";
import type { PlayerId } from "../../shared/PlayerId";
import type { RoomUpdate } from "../../shared/protocol/RoomUpdate";
import type { RoomRecord } from "./RoomRecord";

export function updateFor(record: RoomRecord, playerId: PlayerId): RoomUpdate {
  const seat = record.game?.seats.find((candidate) => candidate.playerId === playerId);
  return {
    room: {
      code: record.code,
      size: record.size,
      playerNames: record.players.map(({ name }) => name),
      mySeat: seat?.seat ?? null,
    },
    game:
      record.game === null || seat === undefined
        ? null
        : { stateVersion: seat.stateVersion, view: viewFor(record.game.saved.state, seat.seat) },
  };
}
