import * as v from "valibot";
import { describe, expect, it } from "vitest";
import { EpochMs } from "../../shared/EpochMs";
import { PlayerId } from "../../shared/PlayerId";
import { DAY_MS } from "../lobby/DAY_MS";
import { EMPTY_LOBBY } from "../lobby/EMPTY_LOBBY";
import { applyQueueOperation } from "./applyQueueOperation";
import { EMPTY_QUEUE } from "./EMPTY_QUEUE";
import type { QueueContext } from "./QueueContext";
import type { QueueState } from "./QueueState";

const NOW = v.parse(EpochMs, 1_761_436_800_000);
const CONTEXT = { now: NOW, siteGamesPerDay: 50 };
const ANN = newPlayerId();
const BEA = newPlayerId();

function newPlayerId(): PlayerId {
  return v.parse(PlayerId, crypto.randomUUID());
}

function at(ms: number): QueueContext {
  return { ...CONTEXT, now: v.parse(EpochMs, NOW + ms) };
}

function joined(state: QueueState, playerId: PlayerId, context: QueueContext): QueueState {
  const joiner = { playerId, standing: "email_confirmed" as const };
  const { change } = applyQueueOperation(state, { kind: "join", joiner, sizes: [2] }, context);
  return { queue: change.queue, lobby: change.lobby };
}

const EMPTY = { queue: EMPTY_QUEUE, lobby: EMPTY_LOBBY };
const MATCHED = joined(joined(EMPTY, ANN, CONTEXT), BEA, CONTEXT);

describe("applying a queue operation", () => {
  it("ends an expired match before the intent and still rejects the late confirmation", () => {
    const outcome = applyQueueOperation(MATCHED, { kind: "confirm", playerId: ANN }, at(20_000));
    expect(outcome.rejection).toBe("no_match_to_confirm");
    expect(outcome.change.queue.matches).toEqual([]);
    expect(outcome.change.notices.map(({ notice }) => notice.kind)).toEqual([
      "match_missed",
      "match_missed",
    ]);
  });

  it("records a closed connection of a waiting player and clears it when one reopens", () => {
    const waiting = joined(EMPTY, ANN, CONTEXT);
    const closed = applyQueueOperation(
      waiting,
      { kind: "connection", playerId: ANN, isConnected: false },
      at(1),
    ).change;
    expect(closed.queue.closedConnections).toEqual([{ playerId: ANN, since: NOW + 1 }]);
    const reopened = applyQueueOperation(
      closed,
      { kind: "connection", playerId: ANN, isConnected: true },
      at(2),
    ).change;
    expect(reopened.queue.closedConnections).toEqual([]);
  });

  it("makes the matches held back by the site game limit when the alarm fires at midnight", () => {
    const full = {
      ...EMPTY,
      lobby: {
        ...EMPTY_LOBBY,
        today: { ...EMPTY_LOBBY.today, day: NOW / DAY_MS, siteGameStarts: 50 },
      },
    };
    const heldBack = joined(joined(full, ANN, CONTEXT), BEA, CONTEXT);
    expect(heldBack.queue.matches).toEqual([]);
    const midnight = v.parse(EpochMs, NOW + DAY_MS);
    const fired = applyQueueOperation(heldBack, { kind: "alarm" }, { ...CONTEXT, now: midnight });
    expect(fired.rejection).toBeNull();
    expect(fired.change.queue.matches.map(({ size }) => size)).toEqual([2]);
  });
});
