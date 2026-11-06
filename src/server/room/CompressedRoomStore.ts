import { ChatBlockStore } from "./ChatBlockStore";
import { decodeRoomRecord } from "./decodeRoomRecord";
import { encodeRoomRecord } from "./encodeRoomRecord";
import type { ChatMessage } from "./ChatMessage";
import type { ChatStorage } from "./ChatStorage";
import type { RoomKv } from "./RoomKv";
import type { RoomRecord } from "./RoomRecord";
import type { RoomStorage } from "./RoomStorage";

const ROOM_KEY = "room";

export class CompressedRoomStore {
  private record: RoomRecord | undefined;
  private isChanged = false;
  private readonly kv: RoomKv;
  private readonly chatBlocks: ChatBlockStore;
  private readonly onRemove: () => void;
  readonly chat: ChatStorage;

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
      this.chatBlocks.removeAll();
      this.onRemove();
    },
  };

  constructor(kv: RoomKv, onRemove: () => void) {
    this.kv = kv;
    this.chatBlocks = new ChatBlockStore(kv);
    this.onRemove = onRemove;
    this.chat = this.chatBlocks.storage;
  }

  async load(): Promise<void> {
    const stored = this.kv.get(ROOM_KEY);
    this.record = await decodeRoomRecord(stored);
    this.isChanged = false;
    if (stored !== undefined && this.record === undefined) {
      this.storage.remove();
    }
    this.chatBlocks.load();
  }

  async save(chatMessage: ChatMessage | null = null): Promise<void> {
    if (chatMessage !== null) {
      this.chat.append(chatMessage);
    }
    this.chatBlocks.save();
    if (!this.isChanged || this.record === undefined) {
      return;
    }
    this.kv.put(ROOM_KEY, await encodeRoomRecord(this.record));
    this.isChanged = false;
  }
}
