import * as v from "valibot";
import { beforeEach, describe, expect, it } from "vitest";
import type { GameHost } from "../../shared/GameHost";
import type { HostEvent } from "../../shared/HostEvent";
import type { ReasonCode } from "../../shared/ReasonCode";
import { RoomCode } from "../../shared/RoomCode";
import { roomUpdateWith } from "../testing/roomUpdateWith";
import { ClientStore } from "./ClientStore";
import { writeSession } from "./writeSession";

type FakeHost = {
  readonly store: ClientStore;
  readonly emit: (event: HostEvent) => void;
  readonly resyncs: () => number;
};

function storeInRoom(): FakeHost {
  writeSession({ token: "token", name: "Ann", roomCode: v.parse(RoomCode, "ABCDEF") });
  let listener: ((event: HostEvent) => void) | null = null;
  let resyncCount = 0;
  let nextId = 1;
  const host: GameHost = {
    sendAction: () => `action-${String(nextId++)}`,
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
  };
}

function rejectFirstAction(fake: FakeHost, code: ReasonCode): void {
  fake.store.sendAction({ type: "play_card", card: "Loft" });
  fake.emit({ type: "rejected", code, actionId: "action-1" });
}

beforeEach(() => {
  localStorage.clear();
});

describe("client store moves", () => {
  it("keeps a sent move as pending until the update that accepts it", () => {
    const fake = storeInRoom();
    fake.store.sendAction({ type: "end_turn" });
    expect(fake.store.getSnapshot().pendingActions).toEqual([
      { id: "action-1", action: { type: "end_turn" } },
    ]);
    fake.emit({ type: "update", update: roomUpdateWith({}), acceptedActionId: "action-1" });
    expect(fake.store.getSnapshot().pendingActions).toEqual([]);
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
    fake.emit({ type: "rejected", code: "already_done", actionId: "action-2" });
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
