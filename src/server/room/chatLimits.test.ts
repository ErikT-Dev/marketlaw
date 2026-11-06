import * as v from "valibot";
import { describe, expect, it } from "vitest";
import { randomForNextAction } from "../../rules/randomForNextAction";
import { EpochMs } from "../../shared/EpochMs";
import { PlayerId } from "../../shared/PlayerId";
import { PROTOCOL_VERSION } from "../../shared/PROTOCOL_VERSION";
import { parseClientMessage } from "../../shared/protocol/parseClientMessage";
import { RoomCode } from "../../shared/RoomCode";
import { chatTrackingStorage } from "./chatTrackingStorage";
import { CompressedRoomStore } from "./CompressedRoomStore";
import { createRoomIn } from "./createRoomIn";
import type { Identity } from "./Identity";
import { receiveAskingLobby } from "./receiveAskingLobby";
import type { RoomKv } from "./RoomKv";

const DAY_MS = 86_400_000;
const START = v.parse(EpochMs, 10 * DAY_MS);
const ANN: Identity = { playerId: v.parse(PlayerId, crypto.randomUUID()), name: "Ann" };

function memoryKv(): RoomKv {
  const entries = new Map<string, unknown>();
  return {
    get: (key) => entries.get(key),
    put: (key, value) => {
      entries.set(key, value);
    },
    delete: (key) => entries.delete(key),
  };
}

async function chatRoom(lobbyAnswers: () => Promise<number>) {
  const kv = memoryKv();
  let rooms = new CompressedRoomStore(kv, () => undefined);
  let now = START;
  let lobbyCalls = 0;
  function storage() {
    return chatTrackingStorage(rooms.storage, () => ({
      messageCount: rooms.chat.messages().length,
      now,
    }));
  }
  await rooms.load();
  createRoomIn(storage(), { code: v.parse(RoomCode, "K7QR2P"), size: 2, isPublic: true }, ANN, now);
  await rooms.save();
  async function say(text: string) {
    const outcome = await receiveAskingLobby(
      storage(),
      {
        connection: { identity: ANN, rejectionTimes: [] },
        parsed: parseClientMessage(
          JSON.stringify({
            protocolVersion: PROTOCOL_VERSION,
            token: "t",
            type: "room",
            action: { type: "send_chat", text },
          }),
        ),
        sender: ANN,
        now,
        randomFor: randomForNextAction,
        gameStart: { seed: 1, now, seatOrder: (players) => players },
        livePlayers: [ANN.playerId],
        chat: { messages: rooms.chat.messages(), quota: rooms.chat.quota() },
      },
      {
        startGame: async () => Promise.resolve(null),
        grantChatQuota: async () => {
          lobbyCalls += 1;
          return lobbyAnswers();
        },
      },
    );
    await rooms.save(outcome.isRoomGone ? null : outcome.chatMessage);
    return outcome.isRoomGone ? null : outcome.reply;
  }
  return {
    say,
    later: (ms: number) => {
      now = v.parse(EpochMs, now + ms);
    },
    reload: async () => {
      rooms = new CompressedRoomStore(kv, () => undefined);
      await rooms.load();
    },
    lobbyCalls: () => lobbyCalls,
    texts: () => rooms.chat.messages().map(({ text }) => text),
  };
}

function rejected(code: string, sendAgainAt: number | null = null) {
  return { type: "rejected", protocolVersion: PROTOCOL_VERSION, actionId: null, code, sendAgainAt };
}

describe("the chat limits", () => {
  it("asks the lobby for a block of 20 messages only when the room has none left", async () => {
    const room = await chatRoom(async () => Promise.resolve(20));
    for (let index = 0; index < 21; index += 1) {
      await room.say(`message ${String(index)}`);
      room.later(2000);
    }
    expect(room.texts()).toHaveLength(21);
    expect(room.lobbyCalls()).toBe(2);
  });

  it("keeps what is left of the block in the saved chat after the room is evicted", async () => {
    const room = await chatRoom(async () => Promise.resolve(20));
    await room.say("first");
    await room.reload();
    room.later(2000);
    await room.say("second");
    expect(room.texts()).toEqual(["first", "second"]);
    expect(room.lobbyCalls()).toBe(1);
  });

  it("asks the lobby again on a new UTC day", async () => {
    const room = await chatRoom(async () => Promise.resolve(20));
    await room.say("today");
    room.later(DAY_MS);
    await room.say("tomorrow");
    expect(room.lobbyCalls()).toBe(2);
  });

  it("does not ask the lobby for a message refused for another reason", async () => {
    const room = await chatRoom(async () => Promise.resolve(20));
    expect(await room.say("  ")).toEqual(rejected("message_empty"));
    expect(room.lobbyCalls()).toBe(0);
    expect(room.texts()).toEqual([]);
  });

  it("refuses with the site cap when the lobby grants nothing and saves nothing", async () => {
    const room = await chatRoom(async () => Promise.resolve(0));
    expect(await room.say("hello")).toEqual(rejected("site_daily_cap"));
    expect(room.texts()).toEqual([]);
  });

  it("refuses with no_answer when the lobby does not answer", async () => {
    const room = await chatRoom(async () => Promise.reject(new Error("the lobby is unreachable")));
    expect(await room.say("hello")).toEqual(rejected("no_answer"));
    expect(room.texts()).toEqual([]);
  });

  it("tells a player who sends too fast when they can send again", async () => {
    const room = await chatRoom(async () => Promise.resolve(20));
    await room.say("one");
    room.later(500);
    expect(await room.say("two")).toEqual(rejected("chat_too_fast", START + 2000));
    room.later(1500);
    await room.say("three");
    expect(room.texts()).toEqual(["one", "three"]);
  });

  it("saves the text with line breaks turned into spaces and the ends trimmed", async () => {
    const room = await chatRoom(async () => Promise.resolve(20));
    await room.say(" good\r\ngame ");
    expect(room.texts()).toEqual(["good  game"]);
  });
});
