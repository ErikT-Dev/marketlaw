import { describe, expect, it } from "vitest";
import { deletePreLaunchRecord } from "./deletePreLaunchRecord";
import { EMPTY_LOBBY } from "./lobby/EMPTY_LOBBY";
import { LOBBY_STORAGE_KEYS } from "./lobby/LOBBY_STORAGE_KEYS";
import { EMPTY_QUEUE } from "./queue/EMPTY_QUEUE";
import { QUEUE_STORAGE_KEYS } from "./queue/QUEUE_STORAGE_KEYS";

type StorageKeys = { readonly preLaunch: string; readonly launched: string };

function storageHolding(entries: ReadonlyArray<readonly [string, unknown]>) {
  const stored = new Map<string, unknown>(entries);
  let deletes = 0;
  return {
    get: (key: string) => stored.get(key),
    delete: (key: string) => {
      deletes += 1;
      return stored.delete(key);
    },
    deletes: () => deletes,
  };
}

type StoredObject = {
  readonly name: string;
  readonly keys: StorageKeys;
  readonly record: unknown;
};

const STORED_OBJECTS: ReadonlyArray<StoredObject> = [
  {
    name: "lobby",
    keys: LOBBY_STORAGE_KEYS,
    record: { ...EMPTY_LOBBY, rooms: [{ code: "K7QR2P" }] },
  },
  {
    name: "ranked queue",
    keys: QUEUE_STORAGE_KEYS,
    record: { ...EMPTY_QUEUE, entries: [{ playerId: "ann" }] },
  },
];

describe("the lobby and the ranked queue after the launch deploy", () => {
  it.each(STORED_OBJECTS)(
    "the $name deletes its pre-launch record and starts with no record",
    ({ keys, record }) => {
      const storage = storageHolding([[keys.preLaunch, record]]);
      deletePreLaunchRecord(storage, keys.preLaunch);
      expect(storage.get(keys.preLaunch)).toBeUndefined();
      expect(storage.get(keys.launched)).toBeUndefined();
      expect(storage.deletes()).toBe(1);
    },
  );

  it.each(STORED_OBJECTS)(
    "the $name writes nothing on a later wake and keeps its launched record",
    ({ keys, record }) => {
      const storage = storageHolding([[keys.launched, record]]);
      deletePreLaunchRecord(storage, keys.preLaunch);
      expect(storage.deletes()).toBe(0);
      expect(storage.get(keys.launched)).toEqual(record);
    },
  );

  it("keeps the launched records apart from the pre-launch ones", () => {
    expect(LOBBY_STORAGE_KEYS.launched).not.toBe(LOBBY_STORAGE_KEYS.preLaunch);
    expect(QUEUE_STORAGE_KEYS.launched).not.toBe(QUEUE_STORAGE_KEYS.preLaunch);
  });
});
