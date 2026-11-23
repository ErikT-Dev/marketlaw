import * as v from "valibot";
import { TEST_PLAYER_ICON } from "../../shared/testing/TEST_PLAYER_ICON";
import { describe, expect, it } from "vitest";
import { randomForNextAction } from "../../rules/randomForNextAction";
import { EpochMs } from "../../shared/EpochMs";
import { PlayerId } from "../../shared/PlayerId";
import { PROTOCOL_VERSION } from "../../shared/PROTOCOL_VERSION";
import { parseClientMessage } from "../../shared/protocol/parseClientMessage";
import { RoomCode } from "../../shared/RoomCode";
import { createRoomIn } from "./createRoomIn";
import { fireRoomAlarm } from "./fireRoomAlarm";
import type { Identity } from "./Identity";
import { joinRoomIn } from "./joinRoomIn";
import { nextAlarmAt } from "./nextAlarmAt";
import { receiveMessage } from "./receiveMessage";
import type { RoomRecord } from "./RoomRecord";
import type { RoomStorage } from "./RoomStorage";
import { withConnection } from "./withConnection";
import { NO_CHAT_CONTEXT } from "./NO_CHAT_CONTEXT";

const START = v.parse(EpochMs, 1_000_000);
const ANN: Identity = {
  playerId: v.parse(PlayerId, crypto.randomUUID()),
  name: "Ann",
  icon: TEST_PLAYER_ICON,
};
const BEA: Identity = {
  playerId: v.parse(PlayerId, crypto.randomUUID()),
  name: "Bea",
  icon: TEST_PLAYER_ICON,
};
const BOTH = [ANN.playerId, BEA.playerId];

function memoryStorage(): RoomStorage & { readonly stored: () => RoomRecord | undefined } {
  let stored: RoomRecord | undefined;
  return {
    read: () => stored,
    write: (record) => {
      stored = record;
    },
    remove: () => {
      stored = undefined;
    },
    stored: () => stored,
  };
}

function at(ms: number): EpochMs {
  return v.parse(EpochMs, START + ms);
}

function fullRoom() {
  const storage = memoryStorage();
  createRoomIn(storage, { code: v.parse(RoomCode, "K7QR2P"), size: 2, isPublic: true }, ANN, START);
  joinRoomIn(storage, BEA, START, BOTH);
  return storage;
}

function accept(storage: RoomStorage, sender: Identity, now: EpochMs) {
  return receiveMessage(storage, {
    connection: { identity: sender, rejectionTimes: [] },
    parsed: parseClientMessage(
      JSON.stringify({
        protocolVersion: PROTOCOL_VERSION,
        token: "t",
        type: "room",
        action: { type: "accept_game" },
      }),
    ),
    sender,
    now,
    randomFor: randomForNextAction,
    gameStart: { seed: 1, now, seatOrder: (players) => players, limitRejectionFor: () => null },
    livePlayers: BOTH,
    chat: NO_CHAT_CONTEXT,
  });
}

describe("a waiting room", () => {
  it("does not start the game for an accept that arrives after the 20 seconds", () => {
    const storage = fullRoom();
    accept(storage, ANN, at(5_000));
    const late = accept(storage, BEA, at(20_001));
    expect(storage.stored()?.game).toBeNull();
    expect(storage.stored()?.players.map(({ name }) => name)).toEqual(["Ann"]);
    expect(late.isRoomGone ? [] : late.removals).toEqual([
      { playerId: BEA.playerId, reason: "timed_out", rejoinAt: at(140_000) },
    ]);
  });

  it("keeps players with an open connection when the 10 seconds after joining run out", () => {
    const storage = fullRoom();
    const record = storage.stored();
    if (record === undefined) {
      throw new Error("no room");
    }
    expect(nextAlarmAt(record)).toBe(at(10_000));
    const fired = fireRoomAlarm(record, at(10_000), randomForNextAction, BOTH);
    expect(fired.removals).toEqual([]);
    expect(fired.record?.waiting.disconnected).toEqual([]);
  });

  it("removes a player 10 seconds after their connection closed, counted from the close", () => {
    const storage = fullRoom();
    const record = storage.stored();
    if (record === undefined) {
      throw new Error("no room");
    }
    const closed = withConnection(record, BEA.playerId, { isConnected: false, at: at(9_000) });
    const early = fireRoomAlarm(closed, at(10_000), randomForNextAction, [ANN.playerId]);
    expect(early.record?.players.map(({ name }) => name)).toEqual(["Ann", "Bea"]);
    const late = fireRoomAlarm(closed, at(19_000), randomForNextAction, [ANN.playerId]);
    expect(late.removals).toEqual([
      { playerId: BEA.playerId, reason: "disconnected", rejoinAt: null },
    ]);
  });

  it("removes a room creator who never connects after 10 seconds, closing the room", () => {
    const storage = memoryStorage();
    createRoomIn(
      storage,
      { code: v.parse(RoomCode, "K7QR2P"), size: 3, isPublic: false },
      ANN,
      START,
    );
    const record = storage.stored();
    if (record === undefined) {
      throw new Error("no room");
    }
    expect(nextAlarmAt(record)).toBe(at(10_000));
    expect(fireRoomAlarm(record, at(10_000), randomForNextAction, []).record).toBeNull();
  });
});
