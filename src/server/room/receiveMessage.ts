import { caughtUpRoom } from "./caughtUpRoom";
import { handleMessage } from "./handleMessage";
import { resumedFor } from "./resumedFor";
import { loadRoom } from "./loadRoom";
import type { ReceiveInput } from "./ReceiveInput";
import type { ReceiveOutcome } from "./ReceiveOutcome";
import type { RoomStorage } from "./RoomStorage";

export function receiveMessage(storage: RoomStorage, input: ReceiveInput): ReceiveOutcome {
  const stored = loadRoom(storage);
  if (stored === null) {
    return { isRoomGone: true };
  }
  const caught = caughtUpRoom(stored, input.now, input.livePlayers);
  const { removals } = caught;
  const record =
    caught.record === null || input.sender === null
      ? caught.record
      : resumedFor(caught.record, input.sender.playerId, input.now, input.randomFor);
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
