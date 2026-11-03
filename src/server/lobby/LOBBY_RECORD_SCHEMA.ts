import * as v from "valibot";
import { PlayerId } from "../../shared/PlayerId";
import { RoomCode } from "../../shared/RoomCode";

export const LOBBY_RECORD_SCHEMA = v.object({
  rooms: v.array(
    v.object({
      code: RoomCode,
      size: v.picklist([2, 3, 4]),
      isPublic: v.boolean(),
      isWaiting: v.boolean(),
      isOver: v.boolean(),
      players: v.array(v.object({ playerId: PlayerId, name: v.string() })),
    }),
  ),
  busy: v.array(v.object({ playerId: PlayerId, code: RoomCode })),
});
