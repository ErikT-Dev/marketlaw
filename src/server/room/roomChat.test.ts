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
import { NO_CHAT_QUOTA } from "./NO_CHAT_QUOTA";

const START = v.parse(EpochMs, 1_000_000);
const ANN: Identity = { playerId: v.parse(PlayerId, crypto.randomUUID()), name: "Ann" };
const BEA: Identity = { playerId: v.parse(PlayerId, crypto.randomUUID()), name: "Bea" };
const CAT: Identity = { playerId: v.parse(PlayerId, crypto.randomUUID()), name: "Cat" };
const EVERYONE = [ANN.playerId, BEA.playerId, CAT.playerId];

function chatRoom() {
  let stored: RoomRecord | undefined;
  let messages: ReadonlyArray<ChatMessage> = [];
  let quota = NO_CHAT_QUOTA;
  let now = START;
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
    () => ({ messageCount: messages.length, now }),
  );
  function send(sender: Identity, body: Readonly<Record<string, unknown>>) {
    const outcome = receiveMessage(storage, {
      connection: { identity: sender, rejectionTimes: [] },
      parsed: parseClientMessage(
        JSON.stringify({ protocolVersion: PROTOCOL_VERSION, token: "t", ...body }),
      ),
      sender,
      now,
      randomFor: randomForNextAction,
      gameStart: {
        seed: 1,
        now: START,
        seatOrder: (players) => players,
        limitRejectionFor: () => null,
      },
      livePlayers: EVERYONE,
      chat: { messages, quota, grantQuota: () => ({ kind: "granted", count: 20 }) },
    });
    const chatMessage = outcome.isRoomGone ? null : outcome.chatMessage;
    if (chatMessage !== null) {
      messages = [...messages, chatMessage.message];
      quota = chatMessage.quota;
    }
    return outcome;
  }
  createRoomIn(storage, { code: v.parse(RoomCode, "K7QR2P"), size: 2, isPublic: true }, ANN, START);
  return {
    storage,
    record: () => stored ?? null,
    messages: () => messages,
    advance: (milliseconds: number) => {
      now = v.parse(EpochMs, now + milliseconds);
    },
    say: (sender: Identity, text: string) =>
      send(sender, { type: "room", action: { type: "send_chat", text } }),
    roomAction: (sender: Identity, type: string) =>
      send(sender, { type: "room", action: { type } }),
    mute: (sender: Identity, type: "mute" | "unmute", playerName: string) =>
      send(sender, { type: "room", action: { type, playerName } }),
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

  it("names the chat lines of a renamed player with the name they joined the room with", () => {
    const room = chatRoom();
    joinRoomIn(room.storage, BEA, START, EVERYONE);
    const renamedBea = { ...BEA, name: "Bea City" };
    joinRoomIn(room.storage, renamedBea, START, EVERYONE);
    room.say(renamedBea, "hello");
    expect(shownTo(room, ANN)).toEqual([
      line("joined_room", "Bea"),
      { kind: "message", from: "Bea", text: "hello", at: START, isOwn: false },
    ]);
    expect(room.record()?.players.map(({ name }) => name)).toEqual(["Ann", "Bea"]);
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

function threePlayerRoom() {
  const room = chatRoom();
  const record = room.record();
  if (record !== null) {
    room.storage.write({ ...record, size: 3 });
  }
  joinRoomIn(room.storage, BEA, START, EVERYONE);
  joinRoomIn(room.storage, CAT, START, EVERYONE);
  return room;
}

function messagesShownTo(room: ReturnType<typeof chatRoom>, player: Identity) {
  return shownTo(room, player).flatMap((entry) => (entry.kind === "message" ? [entry.text] : []));
}

describe("muting in the room chat", () => {
  it("hides a muted player's messages from the muter only, then and on resync", () => {
    const room = threePlayerRoom();
    room.mute(ANN, "mute", "Bea");
    const before = { record: room.record(), messageCount: room.messages().length };
    room.say(BEA, "hi");
    const deliveries = chatDeliveriesBetween(before, room.record(), room.messages());
    expect(deliveries.map(({ playerId }) => playerId)).toEqual([BEA.playerId, CAT.playerId]);
    expect(messagesShownTo(room, ANN)).toEqual([]);
    expect(messagesShownTo(room, CAT)).toEqual(["hi"]);
  });

  it("tells only the muter, who gets their mute list with the chat", () => {
    const room = threePlayerRoom();
    const before = { record: room.record(), messageCount: room.messages().length };
    room.mute(ANN, "mute", "Bea");
    const deliveries = chatDeliveriesBetween(before, room.record(), room.messages());
    expect(deliveries).toEqual([
      {
        playerId: ANN.playerId,
        message: {
          type: "chat",
          protocolVersion: PROTOCOL_VERSION,
          entries: [],
          mutedNames: ["Bea"],
          isFullList: false,
        },
      },
    ]);
    const record = room.record();
    expect(record === null ? [] : chatListFor(record, [], BEA.playerId).mutedNames).toEqual([]);
  });

  it("shows only messages sent after an unmute", () => {
    const room = threePlayerRoom();
    room.mute(ANN, "mute", "Bea");
    room.say(BEA, "first");
    room.mute(ANN, "unmute", "Bea");
    room.advance(2_000);
    room.say(BEA, "second");
    expect(messagesShownTo(room, ANN)).toEqual(["second"]);
  });

  it("refuses to mute oneself or someone outside the room, and repeats change nothing", () => {
    const room = threePlayerRoom();
    for (const name of ["Ann", "Dan"]) {
      const outcome = room.mute(ANN, "mute", name);
      expect(outcome.isRoomGone ? null : outcome.reply).toMatchObject({
        code: "player_not_in_room",
      });
    }
    room.mute(ANN, "mute", "Bea");
    const muted = room.record();
    room.mute(ANN, "mute", "Bea");
    room.mute(ANN, "unmute", "Cat");
    expect(room.record()).toBe(muted);
  });
});
