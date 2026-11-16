import type { Identity } from "../../../src/server/room/Identity.ts";
import type { RoomRecord } from "../../../src/server/room/RoomRecord.ts";
import type { TimedAction } from "../../../src/rules/TimedAction.ts";
import type { EpochMs } from "../../../src/shared/EpochMs.ts";
import type { LobbyGiven } from "./LOBBY_GIVEN_SCHEMA.ts";
import { lobbyRoomFromGiven } from "./lobbyRoomFromGiven.ts";

type GivenSeats = NonNullable<LobbyGiven["seats"]>;

type GivenPlayers = NonNullable<LobbyGiven["players"]>;

const PLAYING_ROOM_CODE = "K7QR2P";

function namesInSeatOrder(players: number, seats: GivenSeats): ReadonlyArray<string> {
  return Array.from({ length: players }, (unused, index) => {
    const given = seats.find(({ seat }) => seat === index + 1);
    if (given === undefined) {
      throw new Error(`given.seats has no seat ${String(index + 1)}`);
    }
    return given.player;
  });
}

function withActionsThisGame(record: RoomRecord, seats: GivenSeats, now: EpochMs): RoomRecord {
  const { game } = record;
  if (game === null) {
    throw new Error("the playing room has no game");
  }
  const actionLog = game.seats.flatMap(({ seat }): ReadonlyArray<TimedAction> => {
    const count = seats.find((given) => given.seat === seat)?.actions_this_game ?? 0;
    return Array.from({ length: count }, () => ({ action: { type: "end_turn", seat }, at: now }));
  });
  return { ...record, game: { ...game, saved: { ...game.saved, actionLog } } };
}

function playingRoomOfSeats(
  players: GivenPlayers,
  seats: GivenSeats,
  identityNamed: (name: string) => Identity,
  now: EpochMs,
): RoomRecord {
  const room = {
    code: PLAYING_ROOM_CODE,
    size: players,
    public: false,
    players: [...namesInSeatOrder(players, seats)],
    state: "playing" as const,
  };
  return withActionsThisGame(lobbyRoomFromGiven(room, identityNamed, now), seats, now);
}

export function givenRoomRecordOf(
  given: LobbyGiven,
  identityNamed: (name: string) => Identity,
  now: EpochMs,
): RoomRecord | null {
  if (given.room !== undefined) {
    return given.room.players.length === 0
      ? null
      : lobbyRoomFromGiven(given.room, identityNamed, now);
  }
  return given.players === undefined
    ? null
    : playingRoomOfSeats(given.players, given.seats ?? [], identityNamed, now);
}
