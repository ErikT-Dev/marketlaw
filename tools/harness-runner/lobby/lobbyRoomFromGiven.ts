import * as v from "valibot";
import { NO_WAITING } from "../../../src/server/room/NO_WAITING.ts";
import { ROOM_SCHEMA_VERSION } from "../../../src/server/room/ROOM_SCHEMA_VERSION.ts";
import type { Identity } from "../../../src/server/room/Identity.ts";
import type { RoomRecord } from "../../../src/server/room/RoomRecord.ts";
import { ROOM_TIMES } from "../../../src/server/room/ROOM_TIMES.ts";
import { startRoomGame } from "../../../src/server/room/startRoomGame.ts";
import { EpochMs } from "../../../src/shared/EpochMs.ts";
import { RoomCode } from "../../../src/shared/RoomCode.ts";
import type { LobbyGiven } from "./LOBBY_GIVEN_SCHEMA.ts";

export function lobbyRoomFromGiven(
  room: NonNullable<LobbyGiven["room"]>,
  identityNamed: (name: string) => Identity,
  now: EpochMs,
): RoomRecord {
  if (room.players[0] !== room.owner) {
    throw new Error("the room's owner must be its first player");
  }
  const waiting: RoomRecord = {
    schemaVersion: ROOM_SCHEMA_VERSION,
    code: v.parse(RoomCode, room.code),
    size: room.size,
    isPublic: room.public,
    players: room.players.map(identityNamed),
    waiting: NO_WAITING,
    game: null,
  };
  switch (room.state) {
    case "waiting":
      return waiting;
    case "accepting":
      return {
        ...waiting,
        waiting: {
          ...NO_WAITING,
          asking: { deadline: v.parse(EpochMs, now + ROOM_TIMES.acceptMs), accepted: [] },
        },
      };
    case "playing":
      return startRoomGame(waiting, { seed: 1, now, seatOrder: (players) => players });
  }
}
