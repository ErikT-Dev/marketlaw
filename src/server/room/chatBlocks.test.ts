import * as v from "valibot";
import { describe, expect, it } from "vitest";
import { EpochMs } from "../../shared/EpochMs";
import { PlayerId } from "../../shared/PlayerId";
import { CompressedRoomStore } from "./CompressedRoomStore";
import type { RoomKv } from "./RoomKv";

const ANN = v.parse(PlayerId, crypto.randomUUID());

function memoryKv() {
  const entries = new Map<string, unknown>();
  let puts = 0;
  const kv: RoomKv = {
    get: (key) => entries.get(key),
    put: (key, value) => {
      entries.set(key, value);
      puts += 1;
    },
    delete: (key) => entries.delete(key),
  };
  return { kv, keys: () => [...entries.keys()], puts: () => puts };
}

function numberedMessage(index: number) {
  return { from: ANN, name: "Ann", text: `message ${String(index)}`, at: v.parse(EpochMs, index) };
}

async function storeWithMessages(memory: ReturnType<typeof memoryKv>, count: number) {
  const store = new CompressedRoomStore(memory.kv, () => undefined);
  await store.load();
  for (let index = 0; index < count; index += 1) {
    await store.save(numberedMessage(index));
  }
  return store;
}

describe("the chat blocks", () => {
  it("writes one row per message in blocks of 20 and loads them back in a fresh store", async () => {
    const memory = memoryKv();
    await storeWithMessages(memory, 21);
    expect(memory.puts()).toBe(21);
    expect(memory.keys()).toEqual(["chat:0", "chat:1"]);
    const reloaded = new CompressedRoomStore(memory.kv, () => undefined);
    await reloaded.load();
    expect(reloaded.chat.messages().map(({ text }) => text)).toEqual(
      Array.from({ length: 21 }, (unused, index) => `message ${String(index)}`),
    );
  });

  it("deletes every chat block with the room", async () => {
    const memory = memoryKv();
    const store = await storeWithMessages(memory, 25);
    store.storage.remove();
    expect(memory.keys()).toEqual([]);
    expect(store.chat.messages()).toEqual([]);
  });
});
