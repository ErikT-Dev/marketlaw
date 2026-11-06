import * as v from "valibot";
import type { SavedGame } from "../../src/rules/SavedGame.ts";
import type { Identity } from "../../src/server/room/Identity.ts";
import { NO_CHAT } from "../../src/server/room/NO_CHAT.ts";
import { NO_WAITING } from "../../src/server/room/NO_WAITING.ts";
import { ROOM_SCHEMA_VERSION } from "../../src/server/room/ROOM_SCHEMA_VERSION.ts";
import type { RoomRecord } from "../../src/server/room/RoomRecord.ts";
import { RoomCode } from "../../src/shared/RoomCode.ts";
import type { SimulatedSeat } from "./SimulatedSeat.ts";

export function simulatedRoomOf(
  saved: SavedGame,
  size: RoomRecord["size"],
  identities: ReadonlyArray<Identity>,
  seats: ReadonlyArray<SimulatedSeat>,
): RoomRecord {
  return {
    schemaVersion: ROOM_SCHEMA_VERSION,
    code: v.parse(RoomCode, "SMQ2AB"),
    size,
    isPublic: false,
    players: identities,
    waiting: NO_WAITING,
    chat: NO_CHAT,
    game: {
      kind: "casual",
      saved,
      seats: seats.map((seat) => ({
        seat: seat.seat,
        playerId: seat.identity.playerId,
        name: seat.identity.name,
        stateVersion: 0,
        acceptedActionIds: [],
      })),
    },
  };
}
