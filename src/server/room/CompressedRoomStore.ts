import { decodeRoomRecord } from "./decodeRoomRecord";
import { encodeRoomRecord } from "./encodeRoomRecord";
import type { RoomKv } from "./RoomKv";
import type { RoomRecord } from "./RoomRecord";
import type { RoomStorage } from "./RoomStorage";

const ROOM_KEY = "room";

export class CompressedRoomStore {
  private record: RoomRecord | undefined;
  private isChanged = false;
  private readonly kv: RoomKv;
  private readonly onRemove: () => void;

  readonly storage: RoomStorage = {
    read: () => this.record,
    write: (record) => {
      this.record = record;
      this.isChanged = true;
    },
    remove: () => {
      this.record = undefined;
      this.isChanged = false;
      this.kv.delete(ROOM_KEY);
      this.onRemove();
    },
  };

  constructor(kv: RoomKv, onRemove: () => void) {
    this.kv = kv;
    this.onRemove = onRemove;
  }

  async load(): Promise<void> {
    const stored = this.kv.get(ROOM_KEY);
    this.record = await decodeRoomRecord(stored);
    this.isChanged = false;
    if (stored !== undefined && this.record === undefined) {
      this.storage.remove();
    }
  }

  async save(): Promise<void> {
    if (!this.isChanged || this.record === undefined) {
      return;
    }
    this.kv.put(ROOM_KEY, await encodeRoomRecord(this.record));
    this.isChanged = false;
  }
}
