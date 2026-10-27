import { handleMessage } from "./handleMessage";
import { loadRoom } from "./loadRoom";
import type { ReceiveInput } from "./ReceiveInput";
import type { ReceiveOutcome } from "./ReceiveOutcome";
import type { RoomStorage } from "./RoomStorage";

export function receiveMessage(storage: RoomStorage, input: ReceiveInput): ReceiveOutcome {
  const record = loadRoom(storage);
  if (record === null) {
    return { isRoomGone: true };
  }
  const { record: next, shouldSave, ...outcome } = handleMessage({ ...input, record });
  if (shouldSave) {
    storage.write(next);
  }
  return { isRoomGone: false, ...outcome };
}
