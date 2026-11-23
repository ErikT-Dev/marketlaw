import * as v from "valibot";
import { TEST_PLAYER_ICON } from "../../shared/testing/TEST_PLAYER_ICON";
import { describe, expect, it } from "vitest";
import { randomForNextAction } from "../../rules/randomForNextAction";
import { EpochMs } from "../../shared/EpochMs";
import { PlayerId } from "../../shared/PlayerId";
import { PROTOCOL_VERSION } from "../../shared/PROTOCOL_VERSION";
import { parseClientMessage } from "../../shared/protocol/parseClientMessage";
import { RoomCode } from "../../shared/RoomCode";
import { claimPlayer } from "../lobby/claimPlayer";
import { EMPTY_LOBBY } from "../lobby/EMPTY_LOBBY";
import { withRoomSummary } from "../lobby/withRoomSummary";
import { createRoomIn } from "./createRoomIn";
import type { Identity } from "./Identity";
import { isPlayerBusyIn } from "./isPlayerBusyIn";
import { joinRoomIn } from "./joinRoomIn";
import { leaveRoomIfFreeIn } from "./leaveRoomIfFreeIn";
import { receiveMessage } from "./receiveMessage";
import type { RoomRecord } from "./RoomRecord";
import type { RoomStorage } from "./RoomStorage";
import { roomSummaryOf } from "./roomSummaryOf";
import { NO_CHAT_CONTEXT } from "./NO_CHAT_CONTEXT";

const NOW = v.parse(EpochMs, 1_000_000);
const CODE = v.parse(RoomCode, "K7QR2P");
const OTHER_CODE = v.parse(RoomCode, "M4TX9C");
const PLAYERS: ReadonlyArray<Identity> = ["Ann", "Bea", "Cid"].map((name) => ({
  playerId: v.parse(PlayerId, crypto.randomUUID()),
  name,
  icon: TEST_PLAYER_ICON,
}));
const LIVE = PLAYERS.map(({ playerId }) => playerId);

function storageOf(): RoomStorage & { readonly stored: () => RoomRecord } {
  let stored: RoomRecord | undefined;
  return {
    read: () => stored,
    write: (record) => {
      stored = record;
    },
    remove: () => {
      stored = undefined;
    },
    stored: () => {
      if (stored === undefined) {
        throw new Error("the room is gone");
      }
      return stored;
    },
  };
}

function send(storage: RoomStorage, sender: Identity, message: Readonly<Record<string, unknown>>) {
  const outcome = receiveMessage(storage, {
    connection: { identity: sender, rejectionTimes: [] },
    parsed: parseClientMessage(
      JSON.stringify({ protocolVersion: PROTOCOL_VERSION, token: "t", ...message }),
    ),
    sender,
    now: NOW,
    randomFor: randomForNextAction,
    gameStart: {
      seed: 1,
      now: NOW,
      seatOrder: (players) => players,
      limitRejectionFor: () => null,
    },
    livePlayers: LIVE,
    chat: NO_CHAT_CONTEXT,
  });
  return outcome.isRoomGone ? null : outcome.reply;
}

function leaveRoom(storage: RoomStorage, sender: Identity) {
  return send(storage, sender, { type: "room", action: { type: "leave_room" } });
}

function leaveGame(storage: ReturnType<typeof storageOf>, sender: Identity) {
  const seat = storage.stored().game?.seats.find(({ playerId }) => playerId === sender.playerId);
  return send(storage, sender, {
    type: "action",
    actionId: `leave-${sender.name}`,
    stateVersion: seat?.stateVersion ?? 0,
    action: { type: "leave_game" },
  });
}

function runningGame() {
  const storage = storageOf();
  const [owner, ...others] = PLAYERS;
  if (owner === undefined) {
    throw new Error("no players");
  }
  createRoomIn(storage, { code: CODE, size: 3, isPublic: true }, owner, NOW);
  for (const player of others) {
    joinRoomIn(storage, player, NOW, LIVE);
  }
  for (const player of PLAYERS) {
    send(storage, player, { type: "room", action: { type: "accept_game" } });
  }
  if (storage.stored().game === null) {
    throw new Error("the game did not start");
  }
  return { storage, leaver: owner };
}

describe("leaving the room during a running game", () => {
  it("is rejected as room_not_waiting while the player is still in the game", () => {
    const { storage, leaver } = runningGame();
    const before = storage.stored();
    expect(leaveRoom(storage, leaver)).toMatchObject({
      type: "rejected",
      code: "room_not_waiting",
    });
    expect(storage.stored()).toBe(before);
  });

  it("is accepted after the player left the game, while the others keep playing", () => {
    const { storage, leaver } = runningGame();
    expect(leaveGame(storage, leaver)).not.toMatchObject({ type: "rejected" });
    expect(leaveRoom(storage, leaver)).not.toMatchObject({ type: "rejected" });
    const room = storage.stored();
    expect(room.players.map(({ name }) => name)).toEqual(["Bea", "Cid"]);
    expect(room.game?.saved.state.phase).not.toBe("ended");
  });
});

describe("a player who left a running game", () => {
  it("is free to join another room while still in the room", () => {
    const { storage, leaver } = runningGame();
    const playing = withRoomSummary(EMPTY_LOBBY, CODE, roomSummaryOf(storage.stored()));
    expect(claimPlayer(playing, leaver.playerId, OTHER_CODE, NOW).isOk).toBe(false);
    leaveGame(storage, leaver);
    const room = storage.stored();
    expect(room.players.map(({ name }) => name)).toContain(leaver.name);
    expect(isPlayerBusyIn(room, leaver.playerId)).toBe(false);
    const afterLeaving = withRoomSummary(playing, CODE, roomSummaryOf(room));
    expect(claimPlayer(afterLeaving, leaver.playerId, OTHER_CODE, NOW).isOk).toBe(true);
  });
});

describe("joining another room", () => {
  it("takes a player who left the running game out of its room", () => {
    const { storage, leaver } = runningGame();
    leaveGame(storage, leaver);
    const lobby = withRoomSummary(EMPTY_LOBBY, CODE, roomSummaryOf(storage.stored()));
    expect(lobby.staying).toEqual([{ playerId: leaver.playerId, code: CODE }]);
    expect(leaveRoomIfFreeIn(storage, leaver.playerId)).toBe(true);
    expect(storage.stored().players.map(({ name }) => name)).toEqual(["Bea", "Cid"]);
    expect(withRoomSummary(lobby, CODE, roomSummaryOf(storage.stored())).staying).toEqual([]);
  });

  it("does not take a player who is still in the game out of the room", () => {
    const { storage, leaver } = runningGame();
    const before = storage.stored();
    expect(leaveRoomIfFreeIn(storage, leaver.playerId)).toBe(false);
    expect(storage.stored()).toBe(before);
  });

  it("takes each player out of the finished room and deletes it with the last one", () => {
    const { storage } = runningGame();
    const [ann, bea, cid] = PLAYERS;
    if (ann === undefined || bea === undefined || cid === undefined) {
      throw new Error("no players");
    }
    leaveGame(storage, ann);
    leaveGame(storage, bea);
    expect(storage.stored().game?.saved.state.phase).toBe("ended");
    const lobby = withRoomSummary(EMPTY_LOBBY, CODE, roomSummaryOf(storage.stored()));
    expect(lobby.staying.map(({ playerId }) => playerId)).toEqual(LIVE);
    expect(leaveRoomIfFreeIn(storage, ann.playerId)).toBe(true);
    expect(leaveRoomIfFreeIn(storage, bea.playerId)).toBe(true);
    expect(storage.stored().players.map(({ name }) => name)).toEqual(["Cid"]);
    expect(leaveRoomIfFreeIn(storage, cid.playerId)).toBe(true);
    expect(storage.read()).toBeUndefined();
    expect(withRoomSummary(lobby, CODE, null).staying).toEqual([]);
  });
});
