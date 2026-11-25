import * as v from "valibot";
import { TEST_PLAYER_ICON } from "../../shared/testing/TEST_PLAYER_ICON";
import { describe, expect, it } from "vitest";
import { applyToSavedGame } from "../../rules/applyToSavedGame";
import { FIRST_PUBLIC_SAVE_SCHEMA_VERSION } from "../../rules/FIRST_PUBLIC_SAVE_SCHEMA_VERSION";
import { replayStartOf } from "../../rules/replayStartOf";
import { SAVE_SCHEMA_VERSION } from "../../rules/SAVE_SCHEMA_VERSION";
import type { SavedGame } from "../../rules/SavedGame";
import { keptReplayRecord } from "../replays/keptReplayRecord";
import { REPLAY_MIGRATION_STEPS } from "../replays/REPLAY_MIGRATION_STEPS";
import type { ReplayRecord } from "../replays/ReplayRecord";
import type { ReplayRecordStatement } from "../replays/ReplayRecordStatement";
import { replayRecordOfRoom } from "../replays/replayRecordOfRoom";
import { FIRST_PUBLIC_ROOM_SCHEMA_VERSION } from "./FIRST_PUBLIC_ROOM_SCHEMA_VERSION";
import endedFixture from "./fixtures/roomVersion7Ended.json" with { type: "json" };
import runningFixture from "./fixtures/roomVersion7Running.json" with { type: "json" };
import { loadRoom } from "./loadRoom";
import { ROOM_MIGRATION_STEPS } from "./ROOM_MIGRATION_STEPS";
import { ROOM_SCHEMA_VERSION } from "./ROOM_SCHEMA_VERSION";
import { STORED_ROOM_SCHEMA } from "./STORED_ROOM_SCHEMA";
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
  return { playerId: v.parse(PlayerId, crypto.randomUUID()), name, icon: TEST_PLAYER_ICON };
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

function storageHolding(record: RoomRecord): CountingStorage {
  const storage = countingStorage();
  storage.write(record);
  return storage;
}

function replayedStateOf(record: ReplayRecord | null): SavedGame["state"] | null {
  if (record === null) {
    return null;
  }
  return record.actionLog.reduce((game, { action, at }) => {
    const result = applyToSavedGame(game, action, at, randomForNextAction(game));
    if (!result.isOk) {
      throw new Error(`replay rejected ${action.type}: ${result.error.code}`);
    }
    return result.value;
  }, replayStartOf(record)).state;
}

function databaseHolding(text: string) {
  const statement: ReplayRecordStatement = {
    bind: () => statement,
    run: async () => Promise.resolve(null),
    first: async () => Promise.resolve(text),
  };
  return { prepare: () => statement };
}

describe("the stored room format", () => {
  it("has one migration step for every room and replay version since the first public one", () => {
    expect(FIRST_PUBLIC_ROOM_SCHEMA_VERSION + ROOM_MIGRATION_STEPS.length).toBe(
      ROOM_SCHEMA_VERSION,
    );
    expect(FIRST_PUBLIC_SAVE_SCHEMA_VERSION + REPLAY_MIGRATION_STEPS.length).toBe(
      SAVE_SCHEMA_VERSION,
    );
  });

  it("loads a first public room of a running game and of an ended game and replays them", () => {
    for (const fixture of [runningFixture, endedFixture]) {
      const stored = v.parse(STORED_ROOM_SCHEMA, fixture);
      const room = loadRoom(storageHolding(stored));
      expect(room).toEqual(stored);
      expect(replayedStateOf(replayRecordOfRoom(room))).toEqual(stored.game?.saved.state);
    }
    expect(endedFixture.game.saved.state.phase).toBe("ended");
  });

  it("goes on with the game of a first public room of a running game", () => {
    const stored = v.parse(STORED_ROOM_SCHEMA, runningFixture);
    const [first] = stored.players;
    const outcome =
      first === undefined ? null : send(storageHolding(stored), first, { type: "resync" });
    expect(outcome?.isRoomGone).toBe(false);
  });

  it("removes a room whose saved game is from before the first public save version", () => {
    const stored = v.parse(STORED_ROOM_SCHEMA, runningFixture);
    const game =
      stored.game === null
        ? null
        : {
            ...stored.game,
            saved: { ...stored.game.saved, schemaVersion: FIRST_PUBLIC_SAVE_SCHEMA_VERSION - 1 },
          };
    const storage = storageHolding({ ...stored, game });
    expect(loadRoom(storage)).toBeNull();
    expect(storage.stored()).toBeUndefined();
  });

  it("exports a kept replay record from the first public version on and none from before it", async () => {
    const stored = v.parse(STORED_ROOM_SCHEMA, endedFixture);
    const record = replayRecordOfRoom(stored);
    const older =
      record === null ? null : { ...record, schemaVersion: FIRST_PUBLIC_SAVE_SCHEMA_VERSION - 1 };
    const kept = await keptReplayRecord(databaseHolding(JSON.stringify(record)), CODE, 0);
    expect(replayedStateOf(kept)).toEqual(stored.game?.saved.state);
    expect(await keptReplayRecord(databaseHolding(JSON.stringify(older)), CODE, 0)).toBeNull();
    expect(await keptReplayRecord(databaseHolding("not json"), CODE, 0)).toBeNull();
  });
});
