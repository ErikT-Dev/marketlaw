import { epochMsAfter } from "../../rules/epochMsAfter";
import type { PlayerId } from "../../shared/PlayerId";
import type { RoomIntent } from "../../shared/protocol/RoomIntent";
import type { ReasonCode } from "../../shared/ReasonCode";
import type { Result } from "../../shared/Result";
import type { GameStart } from "./GameStart";
import type { RoomChange } from "./RoomChange";
import type { RoomRecord } from "./RoomRecord";
import { ROOM_TIMES } from "./ROOM_TIMES";
import { busyPlayersOf } from "./busyPlayersOf";
import { roomWithout } from "./roomWithout";
import { startRoomGame } from "./startRoomGame";
import { withAskingIfFull } from "./withAskingIfFull";

type Outcome = Result<RoomChange, ReasonCode>;

function changed(record: RoomRecord | null): Outcome {
  return { isOk: true, value: { record, removals: [] } };
}

function changeSize(
  record: RoomRecord,
  playerId: PlayerId,
  size: 2 | 3 | 4,
  start: GameStart,
): Outcome {
  if (record.players[0]?.playerId !== playerId) {
    return { isOk: false, error: "not_room_owner" };
  }
  if (size < record.players.length) {
    return { isOk: false, error: "room_size_too_small" };
  }
  if (size === record.size) {
    return changed(record);
  }
  const resized = { ...record, size, waiting: { ...record.waiting, asking: null } };
  return changed(withAskingIfFull(resized, start.now));
}

function acceptGame(record: RoomRecord, playerId: PlayerId, start: GameStart): Outcome {
  const { asking } = record.waiting;
  if (asking === null) {
    return { isOk: false, error: "not_asking" };
  }
  if (asking.accepted.includes(playerId)) {
    return changed(record);
  }
  const accepted = [...asking.accepted, playerId];
  const isEveryone = record.players.every((player) => accepted.includes(player.playerId));
  return changed(
    isEveryone
      ? startRoomGame(record, start)
      : { ...record, waiting: { ...record.waiting, asking: { ...asking, accepted } } },
  );
}

function declineGame(record: RoomRecord, playerId: PlayerId, start: GameStart): Outcome {
  if (record.waiting.asking === null) {
    return { isOk: false, error: "not_asking" };
  }
  const rejoinAt = epochMsAfter(start.now, ROOM_TIMES.rejoinWaitMs);
  const remaining = roomWithout(record, [playerId]);
  return {
    isOk: true,
    value: {
      record:
        remaining === null
          ? null
          : {
              ...remaining,
              waiting: {
                ...remaining.waiting,
                rejoinBlocks: [...remaining.waiting.rejoinBlocks, { playerId, until: rejoinAt }],
              },
            },
      removals: [{ playerId, reason: "declined", rejoinAt }],
    },
  };
}

export function roomActionOutcome(
  record: RoomRecord,
  playerId: PlayerId,
  intent: RoomIntent,
  start: GameStart,
): Outcome {
  if (!record.players.some((player) => player.playerId === playerId)) {
    return { isOk: false, error: "not_in_room" };
  }
  if (
    intent.type === "leave_room" &&
    !busyPlayersOf(record).some((player) => player.playerId === playerId)
  ) {
    return changed(roomWithout(record, [playerId]));
  }
  if (record.game !== null) {
    return { isOk: false, error: "room_not_waiting" };
  }
  switch (intent.type) {
    case "change_size":
      return changeSize(record, playerId, intent.size, start);
    case "leave_room":
      return changed(roomWithout(record, [playerId]));
    case "accept_game":
      return acceptGame(record, playerId, start);
    case "decline_game":
      return declineGame(record, playerId, start);
  }
}
