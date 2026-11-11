import { keptReplayRecordText } from "../../../src/server/replays/keptReplayRecordText.ts";
import { removeOldReplayRecords } from "../../../src/server/replays/removeOldReplayRecords.ts";
import type { EndedRoomRecords } from "./EndedRoomRecords.ts";

export async function replayRecordThen(ended: EndedRoomRecords, now: number): Promise<string> {
  await ended.saved;
  const { room } = ended;
  if (room === null || room.game === null) {
    return "no ended game";
  }
  const { database, storedCount } = ended.replays;
  await removeOldReplayRecords(database, now);
  const exported = await keptReplayRecordText(database, room.code, now);
  if (exported !== null && storedCount() === 1) {
    return "kept";
  }
  return exported === null && storedCount() === 0
    ? "removed"
    : `exported ${String(exported !== null)} with ${String(storedCount())} stored`;
}
