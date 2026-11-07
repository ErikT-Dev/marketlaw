import type { EpochMs } from "../../shared/EpochMs";
import type { RoomStorage } from "./RoomStorage";
import { withChatEvents } from "./withChatEvents";

export function chatTrackingStorage(
  storage: RoomStorage,
  momentOf: () => { readonly messageCount: number; readonly now: EpochMs },
): RoomStorage {
  return {
    read: storage.read,
    write: (record) => {
      storage.write(withChatEvents(storage.read() ?? null, record, momentOf()));
    },
    remove: storage.remove,
  };
}
