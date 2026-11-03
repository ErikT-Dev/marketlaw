import { epochMsAfter } from "../../rules/epochMsAfter";
import type { EpochMs } from "../../shared/EpochMs";
import type { RoomRecord } from "./RoomRecord";
import { ROOM_TIMES } from "./ROOM_TIMES";

export function withAskingIfFull(record: RoomRecord, now: EpochMs): RoomRecord {
  const isFull = record.players.length === record.size;
  if (record.game !== null || !isFull || record.waiting.asking !== null) {
    return record;
  }
  return {
    ...record,
    waiting: {
      ...record.waiting,
      asking: { deadline: epochMsAfter(now, ROOM_TIMES.acceptMs), accepted: [] },
    },
  };
}
