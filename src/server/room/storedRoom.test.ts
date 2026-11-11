import * as v from "valibot";
import { describe, expect, it } from "vitest";
import { startSavedGame } from "../../rules/startSavedGame";
import { EpochMs } from "../../shared/EpochMs";
import { PlayerId } from "../../shared/PlayerId";
import { NO_CHAT } from "./NO_CHAT";
import { NO_WAITING } from "./NO_WAITING";
import { ROOM_SCHEMA_VERSION } from "./ROOM_SCHEMA_VERSION";
import { RoomCode } from "../../shared/RoomCode";
import { CompressedRoomStore } from "./CompressedRoomStore";
import { decodeRoomRecord } from "./decodeRoomRecord";
import { encodeRoomRecord } from "./encodeRoomRecord";
import type { RoomKv } from "./RoomKv";
import type { RoomRecord } from "./RoomRecord";

function startedRoom(): RoomRecord {
  const saved = startSavedGame(
    { players: 2, kind: "casual", startedAt: v.parse(EpochMs, 1_000_000) },
    3,
  );
  const players = ["Ann", "Bea"].map((name) => ({
    playerId: v.parse(PlayerId, crypto.randomUUID()),
    name,
  }));
  return {
    schemaVersion: ROOM_SCHEMA_VERSION,
    code: v.parse(RoomCode, "K7QR2P"),
    size: 2,
    isPublic: false,
    players,
    waiting: NO_WAITING,
    chat: NO_CHAT,
    game: {
      kind: "casual",
      saved,
      seats: saved.state.seats.map((seat, index) => ({
        seat: seat.seat,
        playerId: players[index]?.playerId ?? v.parse(PlayerId, crypto.randomUUID()),
        name: players[index]?.name ?? "",
        stateVersion: 0,
        acceptedActionIds: [],
      })),
    },
  };
}

function memoryKv(start: Readonly<Record<string, unknown>>) {
  let entries: Readonly<Record<string, unknown>> = start;
  let puts = 0;
  const kv: RoomKv = {
    get: (key) => entries[key],
    put: (key, value) => {
      entries = { ...entries, [key]: value };
      puts += 1;
    },
    delete: (key) => {
      entries = Object.fromEntries(Object.entries(entries).filter(([name]) => name !== key));
    },
  };
  return { kv, keys: () => Object.keys(entries), puts: () => puts };
}

describe("a stored room", () => {
  it("is saved compressed and loads back unchanged", async () => {
    const room = startedRoom();
    const stored = await encodeRoomRecord(room);
    expect(stored.length).toBeLessThan(JSON.stringify(room).length / 2);
    expect(await decodeRoomRecord(stored)).toEqual(room);
  });

  it("loads as no room when nothing or something else is stored", async () => {
    expect(await decodeRoomRecord(undefined)).toBeUndefined();
    expect(await decodeRoomRecord({ schemaVersion: 1 })).toBeUndefined();
  });

  it("writes once per change and loads back what it saved in a fresh store", async () => {
    const memory = memoryKv({});
    const store = new CompressedRoomStore(memory.kv, () => undefined);
    await store.load();
    const room = startedRoom();
    store.storage.write(room);
    await store.save();
    await store.save();
    expect(memory.puts()).toBe(1);
    const reloaded = new CompressedRoomStore(memory.kv, () => undefined);
    await reloaded.load();
    expect(reloaded.storage.read()).toEqual(room);
  });

  it("deletes a room stored in an older format or that cannot be read, and closes it", async () => {
    for (const stored of [{ schemaVersion: 1 }, new Uint8Array([1, 2, 3])]) {
      const memory = memoryKv({ room: stored });
      let closings = 0;
      const store = new CompressedRoomStore(memory.kv, () => {
        closings += 1;
      });
      await store.load();
      expect(store.storage.read()).toBeUndefined();
      expect(memory.keys()).toEqual([]);
      expect(closings).toBe(1);
    }
  });
});
