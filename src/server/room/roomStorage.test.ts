import * as v from "valibot";
import { describe, expect, it } from "vitest";
import { randomForNextAction } from "../../rules/randomForNextAction";
import { EpochMs } from "../../shared/EpochMs";
import { PlayerId } from "../../shared/PlayerId";
import { parseClientMessage } from "../../shared/protocol/parseClientMessage";
import { RoomCode } from "../../shared/RoomCode";
import { PROTOCOL_VERSION } from "../../shared/PROTOCOL_VERSION";
import { createRoomIn } from "./createRoomIn";
import type { GameStart } from "./GameStart";
import type { Identity } from "./Identity";
import { joinRoomIn } from "./joinRoomIn";
import { receiveMessage } from "./receiveMessage";
import type { RoomRecord } from "./RoomRecord";
import type { RoomStorage } from "./RoomStorage";
import { NO_CHAT_CONTEXT } from "./NO_CHAT_CONTEXT";

const GAME_START = v.parse(EpochMs, 1_000_000);
const JOIN_ORDER: GameStart = {
  seed: 7,
  now: GAME_START,
  seatOrder: (players) => players,
  limitRejectionFor: () => null,
};

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
const LIVE = [ANN.playerId, BEA.playerId];

function fullRoom(): CountingStorage {
  const storage = countingStorage();
  createRoomIn(storage, { code: CODE, size: 2, isPublic: true }, ANN, GAME_START);
  joinRoomIn(storage, BEA, GAME_START, LIVE);
  send(storage, ANN, { type: "room", action: { type: "accept_game" } });
  send(storage, BEA, { type: "room", action: { type: "accept_game" } });
  return storage;
}

function send(storage: RoomStorage, sender: Identity, message: object, now = GAME_START) {
  return receiveMessage(storage, {
    connection: { identity: null, rejectionTimes: [] },
    parsed: parseClientMessage(
      JSON.stringify({ protocolVersion: PROTOCOL_VERSION, token: "t", ...message }),
    ),
    sender,
    now,
    randomFor: randomForNextAction,
    gameStart: JOIN_ORDER,
    livePlayers: LIVE,
    chat: NO_CHAT_CONTEXT,
  });
}

describe("rooms in storage", () => {
  it("refuses to create a room whose code is taken", () => {
    const storage = countingStorage();
    expect(createRoomIn(storage, { code: CODE, size: 2, isPublic: true }, ANN, GAME_START)).toBe(
      true,
    );
    expect(createRoomIn(storage, { code: CODE, size: 3, isPublic: true }, BEA, GAME_START)).toBe(
      false,
    );
    expect(storage.stored()?.size).toBe(2);
  });

  it("starts the game when everyone in the full room accepts, with seats in the given order", () => {
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
    createRoomIn(storage, { code: CODE, size: 2, isPublic: true }, ANN, GAME_START);
    expect(joinRoomIn(storage, ANN, GAME_START, LIVE).rejection).toBeNull();
    expect(storage.writes()).toBe(1);
    joinRoomIn(storage, BEA, GAME_START, LIVE);
    expect(joinRoomIn(storage, CAT, GAME_START, LIVE).rejection).toEqual({
      reason: "room_full",
      rejoinAt: null,
    });
    send(storage, ANN, { type: "room", action: { type: "accept_game" } });
    send(storage, BEA, { type: "room", action: { type: "accept_game" } });
    expect(joinRoomIn(storage, CAT, GAME_START, LIVE).rejection).toEqual({
      reason: "room_not_waiting",
      rejoinAt: null,
    });
    expect(joinRoomIn(countingStorage(), CAT, GAME_START, LIVE).rejection).toEqual({
      reason: "room_not_found",
      rejoinAt: null,
    });
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
