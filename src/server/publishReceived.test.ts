import * as v from "valibot";
import { TEST_PLAYER_ICON } from "../shared/testing/TEST_PLAYER_ICON";
import { describe, expect, it } from "vitest";
import { randomForNextAction } from "../rules/randomForNextAction";
import { EpochMs } from "../shared/EpochMs";
import { PlayerId } from "../shared/PlayerId";
import { PROTOCOL_VERSION } from "../shared/PROTOCOL_VERSION";
import { parseClientMessage } from "../shared/protocol/parseClientMessage";
import { RoomCode } from "../shared/RoomCode";
import type { PublishingRoom } from "./PublishingRoom";
import { publishReceived } from "./publishReceived";
import type { ReplySocket } from "./ReplySocket";
import { chatTrackingStorage } from "./room/chatTrackingStorage";
import { CompressedRoomStore } from "./room/CompressedRoomStore";
import { createRoomIn } from "./room/createRoomIn";
import type { Identity } from "./room/Identity";
import { joinRoomIn } from "./room/joinRoomIn";
import { loadRoom } from "./room/loadRoom";
import { NO_CHAT_QUOTA } from "./room/NO_CHAT_QUOTA";
import { receiveMessage } from "./room/receiveMessage";

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
const EVERYONE = [ANN.playerId, BEA.playerId];

async function recordingRoom() {
  const log: string[] = [];
  const kv = {
    get: () => undefined,
    put: (key: string) => log.push(`saved ${key}`),
    delete: () => undefined,
  };
  const rooms = new CompressedRoomStore(kv, () => undefined);
  await rooms.load();
  const storage = chatTrackingStorage(rooms.storage, () => ({
    messageCount: rooms.chat.messages().length,
    now: START,
  }));
  const room: PublishingRoom<ReplySocket> = {
    rooms,
    storage,
    sockets: {
      livePlayers: () => EVERYONE,
      sendTo: (playerIds, messageFor) => {
        for (const playerId of playerIds) {
          log.push(`shown to ${playerId}: ${JSON.stringify(messageFor(playerId))}`);
        }
      },
      sendRemovals: () => undefined,
      sendNotices: () => undefined,
      welcome: () => undefined,
      updatePlayers: (record, playerIds) =>
        log.push(`updated ${String(record?.code)} for ${playerIds.join(" ")}`),
    },
  };
  createRoomIn(storage, { code: v.parse(RoomCode, "K7QR2P"), size: 2, isPublic: true }, ANN, START);
  joinRoomIn(storage, BEA, START, EVERYONE);
  await rooms.save();
  log.length = 0;
  return { room, log };
}

function sendChat(room: PublishingRoom<ReplySocket>, text: string) {
  const body = { type: "room", action: { type: "send_chat", text } };
  return receiveMessage(room.storage, {
    connection: { identity: ANN, rejectionTimes: [] },
    parsed: parseClientMessage(
      JSON.stringify({ protocolVersion: PROTOCOL_VERSION, token: "t", ...body }),
    ),
    sender: ANN,
    now: START,
    randomFor: randomForNextAction,
    gameStart: {
      seed: 1,
      now: START,
      seatOrder: (players) => players,
      limitRejectionFor: () => null,
    },
    livePlayers: EVERYONE,
    chat: {
      messages: [],
      quota: NO_CHAT_QUOTA,
      grantQuota: () => ({ kind: "granted", count: 20 }),
    },
  });
}

describe("publishing a received message", () => {
  it("saves a chat message before it answers the sender or shows the message to anyone", async () => {
    const { room, log } = await recordingRoom();
    const before = { record: loadRoom(room.storage), messageCount: 0 };
    const outcome = sendChat(room, "hello mayors");
    expect(outcome.isRoomGone).toBe(false);
    const socket: ReplySocket = {
      send: (message) => log.push(`answered ${typeof message === "string" ? message : "bytes"}`),
      serializeAttachment: () => undefined,
      close: () => undefined,
    };
    if (!outcome.isRoomGone) {
      const attachment = { identity: ANN, tokenHash: "hash", rejectionTimes: [] };
      const sender = { identity: ANN, tokenHash: "hash" };
      const received = { socket, attachment, outcome, sender, isResync: false };
      await publishReceived(room, received, before);
    }
    const firstSaved = log.findIndex((entry) => entry.startsWith("saved chat"));
    const firstOut = log.findIndex((entry) => !entry.startsWith("saved"));
    expect(firstSaved).toBeGreaterThanOrEqual(0);
    expect(firstOut).toBeGreaterThan(firstSaved);
    const shown = log.filter((entry) => entry.includes("hello mayors"));
    expect(shown.map((entry) => entry.split(":")[0])).toEqual([
      `shown to ${ANN.playerId}`,
      `shown to ${BEA.playerId}`,
    ]);
  });
});
