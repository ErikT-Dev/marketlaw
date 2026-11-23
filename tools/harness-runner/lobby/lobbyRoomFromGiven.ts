import { gameStartInJoinOrder } from "../../simulator/gameStartInJoinOrder.ts";
import * as v from "valibot";
import { NO_CHAT } from "../../../src/server/room/NO_CHAT.ts";
import { NO_WAITING } from "../../../src/server/room/NO_WAITING.ts";
import { withChatEvents } from "../../../src/server/room/withChatEvents.ts";
import { ROOM_SCHEMA_VERSION } from "../../../src/server/room/ROOM_SCHEMA_VERSION.ts";
import type { Identity } from "../../../src/server/room/Identity.ts";
import type { RoomRecord } from "../../../src/server/room/RoomRecord.ts";
import { ROOM_TIMES } from "../../../src/server/room/ROOM_TIMES.ts";
import { startRoomGame } from "../../../src/server/room/startRoomGame.ts";
import { endGame } from "../../../src/rules/endGame.ts";
import { EpochMs } from "../../../src/shared/EpochMs.ts";
import { RoomCode } from "../../../src/shared/RoomCode.ts";
import type { LobbyGiven } from "./LOBBY_GIVEN_SCHEMA.ts";

function endedRoom(waiting: RoomRecord, endedMs: number): RoomRecord {
  const playing = startRoomGame(
    waiting,
    gameStartInJoinOrder(1, v.parse(EpochMs, endedMs)),
    "casual",
  );
  const { game } = playing;
  if (game === null) {
    throw new Error("the ended room has no game");
  }
  return {
    ...playing,
    game: { ...game, saved: { ...game.saved, state: endGame(game.saved.state, endedMs) } },
  };
}

function roomInState(
  room: NonNullable<LobbyGiven["room"]>,
  identityNamed: (name: string) => Identity,
  now: EpochMs,
): RoomRecord {
  if (room.owner !== undefined && room.players[0] !== room.owner) {
    throw new Error("the room's owner must be its first player");
  }
  const waiting: RoomRecord = {
    schemaVersion: ROOM_SCHEMA_VERSION,
    code: v.parse(RoomCode, room.code),
    size: room.size,
    isPublic: room.public,
    players: room.players.map((name) => {
      const identity = identityNamed(name);
      return { ...identity, icon: room.icons?.[name] ?? identity.icon };
    }),
    waiting: NO_WAITING,
    game: null,
    chat: NO_CHAT,
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
      return startRoomGame(waiting, gameStartInJoinOrder(1, now), "casual");
    case "ended":
      return endedRoom(waiting, room.ended_ms ?? now);
  }
}

function withGivenKind(
  record: RoomRecord,
  kind: NonNullable<LobbyGiven["room"]>["kind"],
): RoomRecord {
  return record.game === null || kind === undefined
    ? record
    : { ...record, game: { ...record.game, kind } };
}

export function lobbyRoomFromGiven(
  room: NonNullable<LobbyGiven["room"]>,
  identityNamed: (name: string) => Identity,
  now: EpochMs,
): RoomRecord {
  const record = withGivenKind(roomInState(room, identityNamed, now), room.kind);
  return withChatEvents(null, record, { messageCount: 0, now });
}
