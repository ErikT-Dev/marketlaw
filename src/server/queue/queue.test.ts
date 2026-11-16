import * as v from "valibot";
import { describe, expect, it } from "vitest";
import { EpochMs } from "../../shared/EpochMs";
import { PlayerId } from "../../shared/PlayerId";
import { RoomCode } from "../../shared/RoomCode";
import { claimPlayer } from "../lobby/claimPlayer";
import { EMPTY_LOBBY } from "../lobby/EMPTY_LOBBY";
import { changeQueueSizes } from "./changeQueueSizes";
import { EMPTY_QUEUE } from "./EMPTY_QUEUE";
import { joinQueue } from "./joinQueue";
import { leaveQueue } from "./leaveQueue";
import { nextQueueAlarmAt } from "./nextQueueAlarmAt";
import type { QueueState } from "./QueueState";
import { queueViewFor } from "./queueViewFor";

const NOW = v.parse(EpochMs, 1_761_436_800_000);
const CONTEXT = { now: NOW, siteGamesPerDay: 50 };
const ANN = newPlayerId();
const BEA = newPlayerId();
const CAT = newPlayerId();
const DAN = newPlayerId();
function newPlayerId(): PlayerId {
  return v.parse(PlayerId, crypto.randomUUID());
}

const EMPTY: QueueState = { queue: EMPTY_QUEUE, lobby: EMPTY_LOBBY };

function joined(state: QueueState, playerId: PlayerId, sizes: ReadonlyArray<number>) {
  const result = joinQueue(state, { playerId, standing: "email_confirmed" }, sizes, CONTEXT);
  if (!result.isOk) {
    throw new Error(result.error);
  }
  return result.value;
}

describe("the ranked queue", () => {
  it("matches the longest waiting player first even into a smaller game", () => {
    const waiting = joined(joined(joined(EMPTY, ANN, [2]), BEA, [3]), CAT, [3]);
    const changed = joined(waiting, DAN, [2, 3]);
    expect(changed.queue.matches.map(({ players, size }) => ({ players, size }))).toEqual([
      {
        players: [
          { playerId: ANN, sizes: [2] },
          { playerId: DAN, sizes: [2, 3] },
        ],
        size: 2,
      },
    ]);
    expect(changed.notices).toEqual([
      { playerId: ANN, notice: { kind: "match_found", size: 2 } },
      { playerId: DAN, notice: { kind: "match_found", size: 2 } },
    ]);
  });

  it("gives a match 20 seconds to be confirmed", () => {
    const changed = joined(joined(EMPTY, ANN, [2]), BEA, [2]);
    expect(changed.queue.matches[0]?.deadline).toBe(NOW + 20_000);
  });

  it("rejects joining again while already in the queue or confirming", () => {
    const waiting = joined(EMPTY, ANN, [3]);
    const again = joinQueue(waiting, { playerId: ANN, standing: "email_confirmed" }, null, CONTEXT);
    expect(again).toEqual({ isOk: false, error: "busy_elsewhere" });
  });

  it("rejects joining during a rejoin wait and allows it afterwards", () => {
    const playerId = newPlayerId();
    const until = v.parse(EpochMs, NOW + 1);
    const state = { ...EMPTY, queue: { ...EMPTY_QUEUE, rejoinWaits: [{ playerId, until }] } };
    const joiner = { playerId, standing: "email_confirmed" as const };
    expect(joinQueue(state, joiner, null, CONTEXT)).toEqual({
      isOk: false,
      error: "rejoin_too_soon",
    });
    const later = joinQueue(state, joiner, null, { ...CONTEXT, now: until });
    expect(later.isOk && later.value.queue.rejoinWaits).toEqual([]);
  });

  it("keeps a player busy in the lobby while in the queue and frees them on leaving", () => {
    const code = v.parse(RoomCode, "K7QR2P");
    const waiting = joined(EMPTY, ANN, [3]);
    const playerId = ANN;
    expect(claimPlayer(waiting.lobby, playerId, code, NOW)).toEqual({
      isOk: false,
      error: "busy_elsewhere",
    });
    const left = leaveQueue(waiting, playerId);
    expect(left.isOk && left.value.lobby.busy).toEqual([]);
    expect(left.isOk && left.value.queue.entries).toEqual([]);
  });

  it("rejects leaving or changing sizes for a player who is not in the queue", () => {
    const playerId = ANN;
    expect(leaveQueue(EMPTY, playerId)).toEqual({ isOk: false, error: "not_in_queue" });
    expect(changeQueueSizes(EMPTY, playerId, [3], CONTEXT)).toEqual({
      isOk: false,
      error: "not_in_queue",
    });
  });

  it("keeps new game sizes of a confirming player without making another match", () => {
    const confirming = joined(joined(EMPTY, ANN, [2]), BEA, [2]);
    const changed = changeQueueSizes(confirming, ANN, [3, 4], CONTEXT);
    expect(changed.isOk && changed.value.queue.matches[0]?.players[0]).toEqual({
      playerId: ANN,
      sizes: [3, 4],
    });
    expect(changed.isOk && changed.value.notices).toEqual([]);
  });

  it("counts only waiting players and shows each player only their own state", () => {
    const state = joined(joined(joined(EMPTY, ANN, [2]), BEA, [2]), CAT, [3, 4]);
    expect(queueViewFor(state, BEA, CONTEXT)).toEqual({
      counts: { total: 1, bySize: { 2: 0, 3: 1, 4: 1 } },
      own: { kind: "confirming", size: 2, deadline: NOW + 20_000 },
      isSiteGameLimitReached: false,
    });
    expect(queueViewFor(state, DAN, CONTEXT).own).toEqual({ kind: "out" });
  });

  it("wakes at midnight UTC only while the site game limit holds matches back", () => {
    const waiting = joined(EMPTY, ANN, [3]);
    expect(nextQueueAlarmAt(waiting, CONTEXT)).toBeNull();
    expect(nextQueueAlarmAt(waiting, { ...CONTEXT, siteGamesPerDay: 0 })).toBe(NOW + 86_400_000);
  });
});
