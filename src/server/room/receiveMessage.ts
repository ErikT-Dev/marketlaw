import { caughtUpRoom } from "./caughtUpRoom";
import { handleMessage } from "./handleMessage";
import { loadRoom } from "./loadRoom";
import type { ReceiveInput } from "./ReceiveInput";
import type { ReceiveOutcome } from "./ReceiveOutcome";
import type { RoomStorage } from "./RoomStorage";

export function receiveMessage(storage: RoomStorage, input: ReceiveInput): ReceiveOutcome {
  const stored = loadRoom(storage);
  if (stored === null) {
    return { isRoomGone: true };
  }
  const { record, removals } = caughtUpRoom(stored, input.now, input.livePlayers);
  if (record === null) {
    storage.remove();
    return { isRoomGone: true };
  }
  const { record: next, shouldSave, ...outcome } = handleMessage({ ...input, record });
  if (next === null) {
    storage.remove();
  } else if (shouldSave || record !== stored) {
    storage.write(next);
  }
  return { isRoomGone: false, ...outcome, removals };
}
