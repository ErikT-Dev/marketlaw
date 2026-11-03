import type { RoomRecord } from "../../../src/server/room/RoomRecord.ts";
import { ROOM_CODE_CHARACTERS } from "../../../src/shared/ROOM_CODE_CHARACTERS.ts";
import { isRecord } from "../../harness-check/isRecord.ts";

function nameOf(record: RoomRecord, playerId: string): string {
  return record.players.find((player) => player.playerId === playerId)?.name ?? playerId;
}

function stateOf(record: RoomRecord): string {
  if (record.game !== null) {
    return record.game.saved.state.phase === "ended" ? "ended" : "playing";
  }
  return record.waiting.asking === null ? "waiting" : "accepting";
}

function codeFormatOf(record: RoomRecord, expected: unknown): unknown {
  const pattern = new RegExp(`^[${ROOM_CODE_CHARACTERS}]{6}$`);
  const asked = isRecord(expected) ? expected["code_format"] : undefined;
  return pattern.test(record.code) ? asked : record.code;
}

export function lobbyRoomThen(record: RoomRecord | null, expected: unknown): unknown {
  if (record === null) {
    return "closed";
  }
  return {
    size: record.size,
    public: record.isPublic,
    owner: record.players[0]?.name,
    players: record.players.map(({ name }) => name),
    state: stateOf(record),
    accepted: (record.waiting.asking?.accepted ?? []).map((id) => nameOf(record, id)),
    code_format: codeFormatOf(record, expected),
  };
}

export function lobbyGameThen(record: RoomRecord | null): unknown {
  const game = record?.game;
  if (record === null || game === undefined || game === null) {
    return undefined;
  }
  return {
    kind: game.kind,
    seats: Object.fromEntries(
      game.seats.map(({ seat, playerId }) => [String(seat), nameOf(record, playerId)]),
    ),
  };
}
