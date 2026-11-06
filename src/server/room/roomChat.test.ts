import * as v from "valibot";
import { describe, expect, it } from "vitest";
import { randomForNextAction } from "../../rules/randomForNextAction";
import { EpochMs } from "../../shared/EpochMs";
import { PlayerId } from "../../shared/PlayerId";
import { PROTOCOL_VERSION } from "../../shared/PROTOCOL_VERSION";
import { parseClientMessage } from "../../shared/protocol/parseClientMessage";
import { RoomCode } from "../../shared/RoomCode";
import type { ChatMessage } from "./ChatMessage";
import { chatDeliveriesBetween } from "./chatDeliveriesBetween";
import { chatListFor } from "./chatListFor";
import { chatTrackingStorage } from "./chatTrackingStorage";
import { createRoomIn } from "./createRoomIn";
import type { Identity } from "./Identity";
import { joinRoomIn } from "./joinRoomIn";
import { receiveMessage } from "./receiveMessage";
import type { RoomRecord } from "./RoomRecord";
import type { RoomStorage } from "./RoomStorage";

const START = v.parse(EpochMs, 1_000_000);
const ANN: Identity = { playerId: v.parse(PlayerId, crypto.randomUUID()), name: "Ann" };
const BEA: Identity = { playerId: v.parse(PlayerId, crypto.randomUUID()), name: "Bea" };
const CAT: Identity = { playerId: v.parse(PlayerId, crypto.randomUUID()), name: "Cat" };
const EVERYONE = [ANN.playerId, BEA.playerId, CAT.playerId];

function chatRoom() {
  let stored: RoomRecord | undefined;
  let messages: ReadonlyArray<ChatMessage> = [];
  const storage: RoomStorage = chatTrackingStorage(
    {
      read: () => stored,
      write: (record) => {
        stored = record;
      },
      remove: () => {
        stored = undefined;
      },
    },
    () => ({ messageCount: messages.length, now: START }),
  );
  function send(sender: Identity, body: Readonly<Record<string, unknown>>) {
    const outcome = receiveMessage(storage, {
      connection: { identity: sender, rejectionTimes: [] },
      parsed: parseClientMessage(
        JSON.stringify({ protocolVersion: PROTOCOL_VERSION, token: "t", ...body }),
      ),
      sender,
      now: START,
      randomFor: randomForNextAction,
      gameStart: {
        seed: 1,
        now: START,
        seatOrder: (players) => players,
        limitRejectionFor: () => null,
      },
      livePlayers: EVERYONE,
    });
    const chatMessage = outcome.isRoomGone ? null : outcome.chatMessage;
    if (chatMessage !== null) {
      messages = [...messages, chatMessage];
    }
    return outcome;
  }
  createRoomIn(storage, { code: v.parse(RoomCode, "K7QR2P"), size: 2, isPublic: true }, ANN, START);
  return {
    storage,
    record: () => stored ?? null,
    messages: () => messages,
    say: (sender: Identity, text: string) =>
      send(sender, { type: "room", action: { type: "send_chat", text } }),
    roomAction: (sender: Identity, type: string) =>
      send(sender, { type: "room", action: { type } }),
    leaveGame: (sender: Identity) => {
      const seat = stored?.game?.seats.find(({ playerId }) => playerId === sender.playerId);
      return send(sender, {
        type: "action",
        actionId: "leave",
        stateVersion: seat?.stateVersion ?? 0,
        action: { type: "leave_game" },
      });
    },
  };
}

function shownTo(room: ReturnType<typeof chatRoom>, player: Identity) {
  const record = room.record();
  return record === null ? [] : chatListFor(record, room.messages(), player.playerId).entries;
}

function line(event: string, name: string) {
  return { kind: "player_line", event, name, at: START };
}

describe("the room chat", () => {
  it("shows a joining player only what happened since they joined", () => {
    const room = chatRoom();
    room.say(ANN, "anyone?");
    joinRoomIn(room.storage, BEA, START, EVERYONE);
    expect(shownTo(room, BEA)).toEqual([line("joined_room", "Bea")]);
    expect(shownTo(room, ANN)).toEqual([
      { kind: "message", from: "Ann", text: "anyone?", at: START, isOwn: true },
      line("joined_room", "Bea"),
    ]);
  });

  it("sends a new message to every player in the room, marked as their own for the sender", () => {
    const room = chatRoom();
    joinRoomIn(room.storage, BEA, START, EVERYONE);
    const before = { record: room.record(), messageCount: room.messages().length };
    room.say(BEA, "hello");
    const deliveries = chatDeliveriesBetween(before, room.record(), room.messages());
    expect(deliveries.map(({ playerId, message }) => [playerId, message.entries])).toEqual([
      [ANN.playerId, [{ kind: "message", from: "Bea", text: "hello", at: START, isOwn: false }]],
      [BEA.playerId, [{ kind: "message", from: "Bea", text: "hello", at: START, isOwn: true }]],
    ]);
  });

  it("adds grey lines when the game starts, a player leaves it and it ends", () => {
    const room = chatRoom();
    joinRoomIn(room.storage, BEA, START, EVERYONE);
    room.roomAction(ANN, "accept_game");
    room.roomAction(BEA, "accept_game");
    room.leaveGame(BEA);
    expect(shownTo(room, ANN)).toEqual([
      line("joined_room", "Bea"),
      { kind: "game_line", event: "game_started", at: START },
      line("left_game", "Bea"),
      { kind: "game_line", event: "game_ended", at: START },
    ]);
  });

  it("adds a grey line when a player leaves the room and refuses chat from outside it", () => {
    const room = chatRoom();
    joinRoomIn(room.storage, BEA, START, EVERYONE);
    room.roomAction(BEA, "leave_room");
    expect(shownTo(room, ANN)).toEqual([line("joined_room", "Bea"), line("left_room", "Bea")]);
    const outside = room.say(CAT, "let me in");
    expect(outside.isRoomGone ? null : outside.reply).toMatchObject({ code: "not_in_room" });
    expect(room.messages()).toEqual([]);
  });
});
