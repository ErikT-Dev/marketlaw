import type { PlayerId } from "../../../src/shared/PlayerId.ts";
import type { RoomRecord } from "../../../src/server/room/RoomRecord.ts";
import { updateFor } from "../../../src/server/room/updateFor.ts";
import { isRecord } from "../../harness-check/isRecord.ts";

function shownElements(record: RoomRecord, playerId: PlayerId): ReadonlyArray<string> {
  const isInRoom = record.players.some((player) => player.playerId === playerId);
  if (!isInRoom) {
    return [];
  }
  const view = updateFor(record, playerId).game?.view;
  const ownSeat = view?.seats.find((seat) => seat.kind === "own");
  return [
    "room_chat",
    "exit_to_lobby",
    ...(ownSeat?.hasLeft === true ? ["left_game"] : []),
    ...(view?.result === null || view === undefined ? [] : ["game_result"]),
  ];
}

export function roomMessageContains(
  record: RoomRecord,
  playerIdOf: (name: string) => PlayerId,
  expected: unknown,
): unknown {
  const asked = isRecord(expected) ? expected : {};
  const player = typeof asked["player"] === "string" ? asked["player"] : "";
  const contains: ReadonlyArray<unknown> = Array.isArray(asked["contains"])
    ? asked["contains"]
    : [];
  const shown = shownElements(record, playerIdOf(player));
  return {
    player,
    contains: contains.map((element) =>
      typeof element === "string" && shown.includes(element) ? element : undefined,
    ),
  };
}
