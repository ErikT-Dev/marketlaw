import { epochMsAfter } from "../../rules/epochMsAfter";
import type { PlayerId } from "../../shared/PlayerId";
import type { RoomIntent } from "../../shared/protocol/RoomIntent";
import type { ReasonCode } from "../../shared/ReasonCode";
import type { Result } from "../../shared/Result";
import { acceptGameOutcome } from "./acceptGameOutcome";
import type { ChatIntent } from "./ChatIntent";
import type { GameStart } from "./GameStart";
import type { RoomActionChange } from "./RoomActionChange";
import type { RoomRecord } from "./RoomRecord";
import { ROOM_TIMES } from "./ROOM_TIMES";
import { busyPlayersOf } from "./busyPlayersOf";
import { roomWithout } from "./roomWithout";
import { rematchOutcome } from "./rematchOutcome";
import { roomChanged } from "./roomChanged";
import { withAskingIfFull } from "./withAskingIfFull";

type Outcome = Result<RoomActionChange, ReasonCode>;

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
    return roomChanged(record);
  }
  const resized = { ...record, size, waiting: { ...record.waiting, asking: null } };
  return roomChanged(withAskingIfFull(resized, start.now));
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
      notices: [],
      refusal: null,
    },
  };
}

export function roomActionOutcome(
  record: RoomRecord,
  playerId: PlayerId,
  intent: Exclude<RoomIntent, ChatIntent>,
  start: GameStart,
): Outcome {
  if (!record.players.some((player) => player.playerId === playerId)) {
    return { isOk: false, error: "not_in_room" };
  }
  if (
    intent.type === "leave_room" &&
    !busyPlayersOf(record).some((player) => player.playerId === playerId)
  ) {
    return roomChanged(roomWithout(record, [playerId]));
  }
  if (record.game !== null || intent.type === "ask_rematch") {
    return rematchOutcome(record, playerId, intent, start);
  }
  switch (intent.type) {
    case "change_size":
      return changeSize(record, playerId, intent.size, start);
    case "leave_room":
      return roomChanged(roomWithout(record, [playerId]));
    case "accept_game":
      return acceptGameOutcome(record, playerId, start);
    case "decline_game":
      return declineGame(record, playerId, start);
  }
}
