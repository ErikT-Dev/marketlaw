import { epochMsAfter } from "../../rules/epochMsAfter";
import { acceptGameOutcome } from "./acceptGameOutcome";
import type { PlayerId } from "../../shared/PlayerId";
import type { RoomIntent } from "../../shared/protocol/RoomIntent";
import type { ReasonCode } from "../../shared/ReasonCode";
import type { Result } from "../../shared/Result";
import type { ChatIntent } from "./ChatIntent";
import type { GameStart } from "./GameStart";
import type { RoomActionChange } from "./RoomActionChange";
import { roomChanged } from "./roomChanged";
import type { RoomRecord } from "./RoomRecord";
import { ROOM_TIMES } from "./ROOM_TIMES";
import { roomWithout } from "./roomWithout";

type Outcome = Result<RoomActionChange, ReasonCode>;

function isRoomGameEnded(record: RoomRecord): boolean {
  return record.game?.saved.state.phase === "ended";
}

function askRematch(record: RoomRecord, start: GameStart): Outcome {
  if (!isRoomGameEnded(record) || record.players.length < 2 || record.waiting.asking !== null) {
    return { isOk: false, error: "rematch_not_possible" };
  }
  const asking = { deadline: epochMsAfter(start.now, ROOM_TIMES.acceptMs), accepted: [] };
  return roomChanged({ ...record, waiting: { ...record.waiting, asking } });
}

export function rematchOutcome(
  record: RoomRecord,
  playerId: PlayerId,
  intent: Exclude<RoomIntent, ChatIntent>,
  start: GameStart,
): Outcome {
  if (intent.type === "ask_rematch") {
    return askRematch(record, start);
  }
  if (!isRoomGameEnded(record)) {
    return { isOk: false, error: "room_not_waiting" };
  }
  switch (intent.type) {
    case "change_size":
      return { isOk: false, error: "room_not_waiting" };
    case "leave_room":
      return roomChanged(roomWithout(record, [playerId]));
    case "accept_game":
      return acceptGameOutcome(record, playerId, start);
    case "decline_game":
      return record.waiting.asking === null
        ? { isOk: false, error: "not_asking" }
        : roomChanged({ ...record, waiting: { ...record.waiting, asking: null } });
  }
}
