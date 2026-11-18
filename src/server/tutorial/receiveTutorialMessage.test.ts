import * as v from "valibot";
import { describe, expect, it } from "vitest";
import { EpochMs } from "../../shared/EpochMs";
import { PlayerId } from "../../shared/PlayerId";
import { parseTutorialClientMessage } from "../../shared/protocol/parseTutorialClientMessage";
import type { ServerMessage } from "../../shared/protocol/ServerMessage";
import { PROTOCOL_VERSION } from "../../shared/PROTOCOL_VERSION";
import type { Identity } from "../room/Identity";
import { receiveTutorialMessage } from "./receiveTutorialMessage";
import { startTutorialIn } from "./startTutorialIn";
import type { TutorialRecord } from "./TutorialRecord";
import type { TutorialStorage } from "./TutorialStorage";

const NOW = v.parse(EpochMs, 5_000);
const ANN: Identity = {
  playerId: v.parse(PlayerId, "5b0f6a52-3d5e-4f7c-8a41-6c2b9e0d7f13"),
  name: "Ann",
};
const BEA: Identity = {
  playerId: v.parse(PlayerId, "7d0c7f1e-4b7a-4c5e-9a39-2f4d9c1b8e10"),
  name: "Bea",
};

type Room = {
  readonly storage: TutorialStorage;
  readonly writes: () => number;
  readonly send: (
    body: Readonly<Record<string, unknown>>,
    sender?: Identity | null,
  ) => ServerMessage | null;
};

function startedRoom(): Room {
  let stored: TutorialRecord | undefined;
  let writes = 0;
  const storage: TutorialStorage = {
    read: () => stored,
    write: (record) => {
      stored = record;
      writes += 1;
    },
    remove: () => {
      stored = undefined;
    },
  };
  startTutorialIn(storage, ANN, NOW);
  return {
    storage,
    writes: () => writes,
    send: (body, sender = ANN) =>
      receiveTutorialMessage(storage, {
        connection: { identity: null, rejectionTimes: [] },
        parsed: parseTutorialClientMessage(
          JSON.stringify({ protocolVersion: PROTOCOL_VERSION, token: "token-of-Ann", ...body }),
        ),
        sender,
        now: NOW,
      }).reply,
  };
}

function continueMessage(
  actionId: string,
  stateVersion: number,
): Readonly<Record<string, unknown>> {
  return { type: "tutorial", actionId, stateVersion, action: { type: "continue" } };
}

function stepOf(room: Room): unknown {
  return room.storage.read()?.tutorial.stage;
}

describe("the tutorial room", () => {
  it("answers a resync with the tutorial view and writes nothing", () => {
    const room = startedRoom();
    expect(room.send({ type: "resync" })).toMatchObject({
      type: "tutorial_update",
      stateVersion: 0,
      view: { progress: { kind: "step", step: "T1.1", number: 1 } },
    });
    expect(room.writes()).toBe(1);
  });

  it("accepts the step's action with one write and a new state version", () => {
    const room = startedRoom();
    expect(room.send(continueMessage("a1", 0))).toMatchObject({
      type: "tutorial_update",
      acceptedActionId: "a1",
      stateVersion: 1,
    });
    expect(stepOf(room)).toBe("T1.2");
    expect(room.writes()).toBe(2);
  });

  it("returns the original result for a repeated action id and changes nothing more", () => {
    const room = startedRoom();
    room.send(continueMessage("a1", 0));
    expect(room.send(continueMessage("a1", 0))).toMatchObject({ acceptedActionId: "a1" });
    expect(stepOf(room)).toBe("T1.2");
    expect(room.writes()).toBe(2);
  });

  it("rejects an action based on an older state version", () => {
    const room = startedRoom();
    room.send(continueMessage("a1", 0));
    expect(room.send(continueMessage("a2", 0))).toMatchObject({
      type: "rejected",
      code: "stale_state",
    });
    expect(stepOf(room)).toBe("T1.2");
  });

  it("rejects another player and an unknown token", () => {
    const room = startedRoom();
    expect(room.send(continueMessage("a1", 0), BEA)).toMatchObject({ code: "not_in_game" });
    expect(room.send(continueMessage("a1", 0), null)).toMatchObject({ code: "invalid_token" });
    expect(stepOf(room)).toBe("T1.1");
  });

  it("restarts from the first step in place with a new state version", () => {
    const room = startedRoom();
    room.send(continueMessage("a1", 0));
    const restart = {
      type: "tutorial",
      actionId: "a2",
      stateVersion: 1,
      action: { type: "restart_tutorial" },
    };
    expect(room.send(restart)).toMatchObject({ type: "tutorial_update", stateVersion: 2 });
    expect(stepOf(room)).toBe("T1.1");
  });

  it("deletes the room when the player leaves and closes later messages", () => {
    const room = startedRoom();
    const leave = {
      type: "tutorial",
      actionId: "a1",
      stateVersion: 0,
      action: { type: "leave_tutorial" },
    };
    expect(room.send(leave)).toMatchObject({ type: "removed", reason: "left" });
    expect(room.storage.read()).toBeUndefined();
    expect(room.send({ type: "resync" })).toBeNull();
  });

  it("rejects a message of the game room protocol", () => {
    const room = startedRoom();
    expect(room.send({ type: "room", action: { type: "leave_room" } })).toMatchObject({
      code: "malformed_message",
    });
  });
});
