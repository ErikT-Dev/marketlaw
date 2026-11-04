import { keptReplayRecordText } from "../../../src/server/replays/keptReplayRecordText.ts";
import { removeOldReplayRecords } from "../../../src/server/replays/removeOldReplayRecords.ts";
import { saveReplayRecord } from "../../../src/server/replays/saveReplayRecord.ts";
import type { RoomRecord } from "../../../src/server/room/RoomRecord.ts";
import { memoryReplayRecordDatabase } from "./memoryReplayRecordDatabase.ts";

export async function replayRecordThen(endedRoom: RoomRecord | null, now: number): Promise<string> {
  const saved = endedRoom?.game?.saved;
  if (endedRoom === null || saved === undefined) {
    return "no ended game";
  }
  const { database, storedCount } = memoryReplayRecordDatabase();
  await saveReplayRecord(database, endedRoom.code, saved);
  await removeOldReplayRecords(database, now);
  const exported = await keptReplayRecordText(database, endedRoom.code, now);
  if (exported !== null && storedCount() === 1) {
    return "kept";
  }
  return exported === null && storedCount() === 0
    ? "removed"
    : `exported ${String(exported !== null)} with ${String(storedCount())} stored`;
}
