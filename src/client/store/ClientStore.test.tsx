import * as v from "valibot";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { GameHost } from "../../shared/GameHost";
import type { HostEvent } from "../../shared/HostEvent";
import { EpochMs } from "../../shared/EpochMs";
import type { RoomIntent } from "../../shared/protocol/RoomIntent";
import type { ReasonCode } from "../../shared/ReasonCode";
import { RoomCode } from "../../shared/RoomCode";
import { waitingRoomNoticesOf } from "../screens/lobby/waitingRoomNoticesOf";
import { roomUpdateWith } from "../testing/roomUpdateWith";
import { ClientStore } from "./ClientStore";
import { NO_ROOM_CHAT } from "./NO_ROOM_CHAT";
import { writeSession } from "./writeSession";
import { chatMessageEntryOf as chatMessage } from "../testing/chatMessageEntryOf";

type FakeHost = {
  readonly store: ClientStore;
  readonly emit: (event: HostEvent) => void;
  readonly resyncs: () => number;
  readonly roomActions: () => ReadonlyArray<RoomIntent>;
};

function storeInRoom(): FakeHost {
  writeSession({
    token: "token",
    playerId: null,
    name: "Ann",
    isGuest: true,
    roomCode: v.parse(RoomCode, "ABCDEF"),
  });
  let listener: ((event: HostEvent) => void) | null = null;
  let resyncCount = 0;
  let nextId = 1;
  const roomActions: RoomIntent[] = [];
  const host: GameHost = {
    sendAction: () => `action-${String(nextId++)}`,
    sendRoomAction: (action) => {
      roomActions.push(action);
      return true;
    },
    sendTutorialAction: () => null,
    requestResync: () => {
      resyncCount += 1;
    },
    subscribe: (newListener) => {
      listener = newListener;
      return () => undefined;
    },
    close: () => undefined,
  };
  const store = new ClientStore(() => host);
  return {
    store,
    emit: (event) => {
      listener?.(event);
    },
    resyncs: () => resyncCount,
    roomActions: () => roomActions,
  };
}

function fakeHost(): GameHost {
  return {
    sendAction: () => null,
    sendRoomAction: () => false,
    sendTutorialAction: () => null,
    requestResync: () => undefined,
    subscribe: () => () => undefined,
    close: () => undefined,
  };
}

function rejectFirstAction(fake: FakeHost, code: ReasonCode): void {
  fake.store.sendAction({ type: "play_card", card: "Loft" });
  fake.emit({ type: "rejected", code, actionId: "action-1", sendAgainAt: null });
}

beforeEach(() => {
  localStorage.clear();
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

const SEAT_LINK = {
  token: "seat-token",
  playerId: null,
  name: "Seat 1",
  isGuest: true,
  roomCode: v.parse(RoomCode, "K7QR2P"),
};

const SEAT_PLAYER = "3e7a1c9d-2b4f-4d6e-8a0c-5f1b7d3e9a26";

function serverSaysTestSeat(isTestRoomSeat: boolean): void {
  vi.stubGlobal("fetch", async (path: string) =>
    Promise.resolve(
      Response.json(
        path === "/api/session"
          ? { isLoggedIn: true, playerId: SEAT_PLAYER, name: "Seat 1", isGuest: true }
          : { isTestRoomSeat },
      ),
    ),
  );
}

describe("client store moves", () => {
  it("keeps a sent move as pending until the update that accepts it", () => {
    const fake = storeInRoom();
    fake.store.sendAction({ type: "end_turn" });
    expect(fake.store.getSnapshot().pendingActions).toEqual([
      { id: "action-1", action: { type: "end_turn" } },
    ]);
    fake.emit({
      type: "update",
      update: roomUpdateWith({}),
      acceptedActionId: "action-1",
      serverNow: v.parse(EpochMs, 0),
    });
    expect(fake.store.getSnapshot().pendingActions).toEqual([]);
  });

  it("keeps a time-out notice until it is closed, and the server clock offset", () => {
    vi.useFakeTimers();
    vi.setSystemTime(10_000);
    const fake = storeInRoom();
    fake.emit({
      type: "update",
      update: roomUpdateWith({}),
      acceptedActionId: null,
      serverNow: v.parse(EpochMs, 12_500),
    });
    const notice = { kind: "timed_out", gameKind: "ranked", inARow: 1, of: 3 } as const;
    fake.emit({ type: "notice", notice });
    expect(fake.store.getSnapshot().serverClockOffsetMs).toBe(2_500);
    expect(fake.store.getSnapshot().timeOutNotice).toEqual(notice);
    fake.store.dismissTimeOutNotice();
    expect(fake.store.getSnapshot().timeOutNotice).toBeNull();
  });

  it("shows the site game limit to the last accepter and the others alike in the waiting room", () => {
    const last = storeInRoom();
    last.emit({ type: "rejected", code: "site_game_limit", actionId: null, sendAgainAt: null });
    expect(waitingRoomNoticesOf(last.store.getSnapshot())).toEqual({
      rejection: null,
      hasSiteGameLimitNotice: true,
    });
    const other = storeInRoom();
    other.emit({ type: "notice", notice: { kind: "site_game_limit" } });
    expect(waitingRoomNoticesOf(other.store.getSnapshot())).toEqual({
      rejection: null,
      hasSiteGameLimitNotice: true,
    });
    other.store.dismissTimeOutNotice();
    expect(waitingRoomNoticesOf(other.store.getSnapshot()).hasSiteGameLimitNotice).toBe(false);
  });

  it("rolls back a rejected move and keeps it with its code for the message", () => {
    const fake = storeInRoom();
    rejectFirstAction(fake, "not_enough_funds");
    expect(fake.store.getSnapshot().pendingActions).toEqual([]);
    expect(fake.store.getSnapshot().rejectedMove).toEqual({
      action: { type: "play_card", card: "Loft" },
      code: "not_enough_funds",
    });
  });

  it("shows nothing for a stale state", () => {
    const fake = storeInRoom();
    rejectFirstAction(fake, "stale_state");
    expect(fake.store.getSnapshot().pendingActions).toEqual([]);
    expect(fake.store.getSnapshot().rejectedMove).toBeNull();
  });

  it("forgets the rejected move on the next move or when dismissed", () => {
    const fake = storeInRoom();
    rejectFirstAction(fake, "already_done");
    fake.store.sendAction({ type: "end_turn" });
    expect(fake.store.getSnapshot().rejectedMove).toBeNull();
    fake.emit({ type: "rejected", code: "already_done", actionId: "action-2", sendAgainAt: null });
    fake.store.dismissRejection();
    expect(fake.store.getSnapshot().rejectedMove).toBeNull();
  });

  it("reloads the game after a rejection that says the page reloads it", () => {
    const fake = storeInRoom();
    rejectFirstAction(fake, "malformed_message");
    expect(fake.resyncs()).toBe(1);
    rejectFirstAction(fake, "card_not_in_hand");
    expect(fake.resyncs()).toBe(1);
  });
});

describe("the room chat in the store", () => {
  it("adds new entries, counts others' messages as unread until read, and keeps the mute list", () => {
    const fake = storeInRoom();
    fake.emit({ type: "chat", entries: [chatMessage("Bea")], mutedNames: [], isFullList: true });
    fake.emit({
      type: "chat",
      entries: [chatMessage("Ann", true), chatMessage("Cid")],
      mutedNames: ["Dan"],
      isFullList: false,
    });
    const chat = fake.store.getSnapshot().chat;
    expect(chat.entries.map((entry) => entry.kind === "message" && entry.from)).toEqual([
      "Bea",
      "Ann",
      "Cid",
    ]);
    expect(chat.unreadCount).toBe(1);
    expect(chat.mutedNames).toEqual(["Dan"]);
    fake.store.markChatRead();
    expect(fake.store.getSnapshot().chat.unreadCount).toBe(0);
  });

  it("replaces the chat with a full list and counts only the messages it did not have", () => {
    const fake = storeInRoom();
    fake.emit({ type: "chat", entries: [chatMessage("Bea")], mutedNames: [], isFullList: true });
    const missed = [chatMessage("Bea"), chatMessage("Cid"), chatMessage("Cid")];
    fake.emit({ type: "chat", entries: missed, mutedNames: [], isFullList: true });
    expect(fake.store.getSnapshot().chat.entries).toHaveLength(3);
    expect(fake.store.getSnapshot().chat.unreadCount).toBe(2);
  });

  it("keeps a refused message with its limit and when to send again, not as a rejected move", () => {
    const fake = storeInRoom();
    const sendAgainAt = v.parse(EpochMs, 1_000_000);
    fake.store.sendRoomAction({ type: "send_chat", text: "Hello" });
    fake.emit({ type: "rejected", code: "chat_too_fast", actionId: null, sendAgainAt });
    expect(fake.store.getSnapshot().chat.refused).toEqual({
      code: "chat_too_fast",
      sendAgainAt,
      text: "Hello",
    });
    expect(fake.store.getSnapshot().rejectedMove).toBeNull();
    fake.store.sendRoomAction({ type: "send_chat", text: "Hello again" });
    expect(fake.store.getSnapshot().chat.refused).toBeNull();
  });

  it("gives a refusal the text of the oldest message the server has not answered", () => {
    const fake = storeInRoom();
    fake.store.sendRoomAction({ type: "send_chat", text: "First" });
    fake.store.sendRoomAction({ type: "send_chat", text: "Second" });
    fake.emit({
      type: "chat",
      entries: [chatMessage("Ann", true)],
      mutedNames: [],
      isFullList: false,
    });
    fake.emit({ type: "rejected", code: "chat_room_limit", actionId: null, sendAgainAt: null });
    expect(fake.store.getSnapshot().chat.refused?.text).toBe("Second");
    expect(fake.store.getSnapshot().chat.unansweredTexts).toEqual([]);
  });

  it("gives back a message refused for any reason and pairs later refusals with later texts", () => {
    const fake = storeInRoom();
    fake.store.sendRoomAction({ type: "send_chat", text: "First" });
    fake.store.sendRoomAction({ type: "send_chat", text: "Second" });
    fake.emit({ type: "rejected", code: "no_answer", actionId: null, sendAgainAt: null });
    expect(fake.store.getSnapshot().chat.refused).toEqual({
      code: "no_answer",
      sendAgainAt: null,
      text: "First",
    });
    fake.emit({ type: "rejected", code: "chat_too_fast", actionId: null, sendAgainAt: null });
    expect(fake.store.getSnapshot().chat.refused?.text).toBe("Second");
    expect(fake.store.getSnapshot().rejectedMove).toBeNull();
  });

  it("forgets the chat when the player leaves the room", () => {
    const fake = storeInRoom();
    fake.emit({ type: "chat", entries: [chatMessage("Bea")], mutedNames: [], isFullList: false });
    fake.store.exitToLobby();
    expect(fake.store.getSnapshot().chat).toEqual(NO_ROOM_CHAT);
  });
});

describe("leaving a room", () => {
  it("takes the player out of the room when they exit to the lobby", () => {
    const fake = storeInRoom();
    fake.store.exitToLobby();
    expect(fake.roomActions()).toEqual([{ type: "leave_room" }]);
    expect(fake.store.getSnapshot().session?.roomCode).toBeNull();
  });

  it("says the room was not found when it is gone, until the notice is closed", () => {
    const fake = storeInRoom();
    fake.emit({ type: "connection", status: "room_gone" });
    expect(fake.store.getSnapshot().session?.roomCode).toBeNull();
    expect(fake.store.getSnapshot().goneRoomCode).toBe("ABCDEF");
    fake.store.dismissRemoval();
    expect(fake.store.getSnapshot().goneRoomCode).toBeNull();
  });
});

describe("seat links", () => {
  it("ignores a link the server does not confirm as a test room seat", async () => {
    serverSaysTestSeat(false);
    const store = new ClientStore(() => fakeHost());
    await store.startFromSeatLink(SEAT_LINK, () => true);
    expect(store.getSnapshot().session).toBeNull();
    expect(store.getSnapshot().notice).toBe(
      "That link is not a test room seat, so it was ignored.",
    );
  });

  it("signs in to a confirmed seat when the browser has no account and learns its player id", async () => {
    serverSaysTestSeat(true);
    const store = new ClientStore(() => fakeHost());
    await store.startFromSeatLink(SEAT_LINK, () => false);
    expect(store.getSnapshot().session).toEqual({ ...SEAT_LINK, playerId: SEAT_PLAYER });
  });

  it("keeps a different account when the player says no, and switches when they say yes", async () => {
    serverSaysTestSeat(true);
    const { store } = storeInRoom();
    await store.startFromSeatLink(SEAT_LINK, () => false);
    expect(store.getSnapshot().session?.token).toBe("token");
    await store.startFromSeatLink(SEAT_LINK, () => true);
    expect(store.getSnapshot().session).toEqual({ ...SEAT_LINK, playerId: SEAT_PLAYER });
  });
});
