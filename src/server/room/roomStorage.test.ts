import * as v from "valibot";
import { describe, expect, it } from "vitest";
import { randomForNextAction } from "../../rules/randomForNextAction";
import { EpochMs } from "../../shared/EpochMs";
import { PlayerId } from "../../shared/PlayerId";
import { parseClientMessage } from "../../shared/protocol/parseClientMessage";
import { RoomCode } from "../../shared/RoomCode";
import { createRoomIn } from "./createRoomIn";
import type { Identity } from "./Identity";
import { joinRoomIn } from "./joinRoomIn";
import { receiveMessage } from "./receiveMessage";
import type { RoomRecord } from "./RoomRecord";
import type { RoomStorage } from "./RoomStorage";

type CountingStorage = RoomStorage & {
  readonly writes: () => number;
  readonly stored: () => RoomRecord | undefined;
};

function countingStorage(): CountingStorage {
  let stored: RoomRecord | undefined;
  let writes = 0;
  return {
    read: () => stored,
    write: (record) => {
      stored = record;
      writes += 1;
    },
    remove: () => {
      stored = undefined;
    },
    writes: () => writes,
    stored: () => stored,
  };
}

function player(name: string): Identity {
  return { playerId: v.parse(PlayerId, crypto.randomUUID()), name };
}

const CODE = v.parse(RoomCode, "K7QR2P");
const ANN = player("Ann");
const BEA = player("Bea");
const CAT = player("Cat");

function fullRoom(): CountingStorage {
  const storage = countingStorage();
  createRoomIn(storage, { code: CODE, size: 2 }, ANN);
  joinRoomIn(storage, BEA, 7);
  return storage;
}

function send(storage: RoomStorage, sender: Identity, message: object) {
  return receiveMessage(storage, {
    connection: { identity: null, rejectionTimes: [] },
    parsed: parseClientMessage(JSON.stringify({ protocolVersion: 1, token: "t", ...message })),
    sender,
    now: v.parse(EpochMs, 0),
    randomFor: randomForNextAction,
  });
}

describe("rooms in storage", () => {
  it("refuses to create a room whose code is taken", () => {
    const storage = countingStorage();
    expect(createRoomIn(storage, { code: CODE, size: 2 }, ANN)).toBe(true);
    expect(createRoomIn(storage, { code: CODE, size: 3 }, BEA)).toBe(false);
    expect(storage.stored()?.size).toBe(2);
  });

  it("starts the game when the room is full, with seats in the order players joined", () => {
    const storage = fullRoom();
    expect(storage.stored()?.game?.seats.map(({ seat, playerId }) => ({ seat, playerId }))).toEqual(
      [
        { seat: 1, playerId: ANN.playerId },
        { seat: 2, playerId: BEA.playerId },
      ],
    );
  });

  it("rejects joining a full room or a room whose game started, and allows joining twice", () => {
    const storage = countingStorage();
    createRoomIn(storage, { code: CODE, size: 2 }, ANN);
    expect(joinRoomIn(storage, ANN, 1)).toBeNull();
    expect(storage.writes()).toBe(1);
    joinRoomIn(storage, BEA, 1);
    expect(joinRoomIn(storage, CAT, 1)).toBe("room_not_waiting");
    expect(joinRoomIn(countingStorage(), CAT, 1)).toBe("room_not_found");
  });

  it("writes one row for an accepted action and none for a rejected one or a resync", () => {
    const storage = fullRoom();
    const before = storage.writes();
    send(storage, ANN, { type: "resync" });
    send(storage, ANN, {
      type: "action",
      actionId: "a1",
      stateVersion: 3,
      action: { type: "end_turn" },
    });
    expect(storage.writes()).toBe(before);
    send(storage, ANN, {
      type: "action",
      actionId: "a2",
      stateVersion: 0,
      action: { type: "end_turn" },
    });
    expect(storage.writes()).toBe(before + 1);
  });

  it("rejects a resync from someone who is not in the room", () => {
    const outcome = send(fullRoom(), CAT, { type: "resync" });
    expect(outcome.isRoomGone ? undefined : outcome.reply).toMatchObject({
      type: "rejected",
      code: "not_in_game",
    });
  });

  it("removes a room saved by an older version and reports it gone", () => {
    const storage = fullRoom();
    const stored = storage.stored();
    if (stored === undefined) {
      throw new Error("the room was not saved");
    }
    storage.write({ ...stored, schemaVersion: 0 });
    expect(send(storage, ANN, { type: "resync" })).toEqual({ isRoomGone: true });
    expect(storage.stored()).toBeUndefined();
  });
});
