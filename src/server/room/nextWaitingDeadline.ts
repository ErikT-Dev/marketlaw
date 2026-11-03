import type { RoomRecord } from "./RoomRecord";
import { ROOM_TIMES } from "./ROOM_TIMES";

export function nextWaitingDeadline(record: RoomRecord): number | null {
  if (record.game !== null) {
    return null;
  }
  const deadlines = [
    ...(record.waiting.asking === null ? [] : [record.waiting.asking.deadline]),
    ...record.waiting.disconnected.map(({ since }) => since + ROOM_TIMES.waitingDisconnectMs),
  ];
  return deadlines.length === 0 ? null : Math.min(...deadlines);
}
