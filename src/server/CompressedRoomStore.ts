import { decodeRoomRecord } from "./room/decodeRoomRecord";
import { encodeRoomRecord } from "./room/encodeRoomRecord";
import type { RoomRecord } from "./room/RoomRecord";
import type { RoomStorage } from "./room/RoomStorage";

const ROOM_KEY = "room";

export class CompressedRoomStore {
  private record: RoomRecord | undefined;
  private isChanged = false;
  private readonly kv: SyncKvStorage;
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

  constructor(kv: SyncKvStorage, onRemove: () => void) {
    this.kv = kv;
    this.onRemove = onRemove;
  }

  async load(): Promise<void> {
    this.record = await decodeRoomRecord(this.kv.get(ROOM_KEY));
    this.isChanged = false;
  }

  async save(): Promise<void> {
    if (!this.isChanged || this.record === undefined) {
      return;
    }
    this.kv.put(ROOM_KEY, await encodeRoomRecord(this.record));
    this.isChanged = false;
  }
}
