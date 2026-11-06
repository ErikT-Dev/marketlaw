import * as v from "valibot";
import { CHAT_BLOCK_SCHEMA } from "./CHAT_BLOCK_SCHEMA";
import type { ChatMessage } from "./ChatMessage";
import type { ChatStorage } from "./ChatStorage";
import type { RoomKv } from "./RoomKv";

const MESSAGES_PER_BLOCK = 20;

function keyOf(block: number): string {
  return `chat:${String(block)}`;
}

function messagesIn(stored: unknown): ReadonlyArray<ChatMessage> | null {
  if (!(stored instanceof Uint8Array)) {
    return null;
  }
  try {
    const parsed = v.safeParse(CHAT_BLOCK_SCHEMA, JSON.parse(new TextDecoder().decode(stored)));
    return parsed.success ? parsed.output.messages : null;
  } catch {
    return null;
  }
}

export class ChatBlockStore {
  private messages: ReadonlyArray<ChatMessage> = [];
  private isLoaded = false;
  private changedFromBlock: number | null = null;
  private readonly kv: RoomKv;

  readonly storage: ChatStorage = {
    messages: () => this.messages,
    append: (message) => {
      const block = Math.floor(this.messages.length / MESSAGES_PER_BLOCK);
      this.changedFromBlock = Math.min(this.changedFromBlock ?? block, block);
      this.messages = [...this.messages, message];
    },
  };

  constructor(kv: RoomKv) {
    this.kv = kv;
  }

  load(): void {
    if (this.isLoaded) {
      return;
    }
    let loaded: ReadonlyArray<ChatMessage> = [];
    for (let block = 0; ; block += 1) {
      const messages = messagesIn(this.kv.get(keyOf(block)));
      if (messages === null) {
        break;
      }
      loaded = [...loaded, ...messages];
    }
    this.messages = loaded;
    this.isLoaded = true;
    this.changedFromBlock = null;
  }

  save(): void {
    const from = this.changedFromBlock;
    if (from === null) {
      return;
    }
    const blockCount = Math.ceil(this.messages.length / MESSAGES_PER_BLOCK);
    for (let block = from; block < blockCount; block += 1) {
      const start = block * MESSAGES_PER_BLOCK;
      const messages = this.messages.slice(start, start + MESSAGES_PER_BLOCK);
      this.kv.put(keyOf(block), new TextEncoder().encode(JSON.stringify({ messages })));
    }
    this.changedFromBlock = null;
  }

  removeAll(): void {
    for (let block = 0; this.kv.get(keyOf(block)) !== undefined; block += 1) {
      this.kv.delete(keyOf(block));
    }
    this.messages = [];
    this.isLoaded = true;
    this.changedFromBlock = null;
  }
}
