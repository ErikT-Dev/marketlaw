import * as v from "valibot";
import { describe, expect, it } from "vitest";
import { EpochMs } from "../../shared/EpochMs";
import { PlayerId } from "../../shared/PlayerId";
import { EMPTY_LOBBY } from "../lobby/EMPTY_LOBBY";
import { confirmMatch } from "./confirmMatch";
import { EMPTY_QUEUE } from "./EMPTY_QUEUE";
import { fireQueueAlarm } from "./fireQueueAlarm";
import { joinQueue } from "./joinQueue";
import { leaveQueue } from "./leaveQueue";
import { nextQueueAlarmAt } from "./nextQueueAlarmAt";
import { queueViewFor } from "./queueViewFor";
import type { QueueChange } from "./QueueChange";
import type { QueueContext } from "./QueueContext";
import type { QueueState } from "./QueueState";
import { withQueueConnection } from "./withQueueConnection";

const NOW = v.parse(EpochMs, 1_761_436_800_000);
const CONTEXT = { now: NOW, siteGamesPerDay: 50 };
const ANN = newPlayerId();
const BEA = newPlayerId();
const CAT = newPlayerId();
function newPlayerId(): PlayerId {
  return v.parse(PlayerId, crypto.randomUUID());
}

function at(ms: number): QueueContext {
  return { ...CONTEXT, now: v.parse(EpochMs, NOW + ms) };
}

function valueOf<T>(result: { isOk: true; value: T } | { isOk: false; error: string }): T {
  if (!result.isOk) {
    throw new Error(result.error);
  }
  return result.value;
}

function joined(state: QueueState, playerId: PlayerId): QueueChange {
  const joiner = { playerId, standing: "email_confirmed" as const };
  return valueOf(joinQueue(state, joiner, [2], CONTEXT));
}

const MATCHED = joined(joined({ queue: EMPTY_QUEUE, lobby: EMPTY_LOBBY }, ANN), BEA);

describe("confirming a ranked match", () => {
  it("rejects a confirmation at the deadline as too late", () => {
    expect(confirmMatch(MATCHED, ANN, at(20_000))).toEqual({
      isOk: false,
      error: "no_match_to_confirm",
    });
  });

  it("starts the game and counts it when every player confirms", () => {
    const changed = valueOf(confirmMatch(valueOf(confirmMatch(MATCHED, BEA, at(1))), ANN, at(2)));
    expect(changed.starts).toEqual([{ players: [ANN, BEA], size: 2 }]);
    expect(changed.queue.matches).toEqual([]);
    expect(changed.lobby.today.siteGameStarts).toBe(1);
  });

  it("declines the match when a confirming player leaves the queue", () => {
    const changed = valueOf(leaveQueue(MATCHED, ANN, at(1)));
    expect(changed.queue.entries).toEqual([{ playerId: BEA, sizes: [2] }]);
    expect(changed.queue.rejoinWaits).toEqual([{ playerId: ANN, until: NOW + 120_001 }]);
    expect(changed.lobby.busy.map(({ playerId }) => playerId)).toEqual([BEA]);
    expect(changed.notices).toEqual([
      { playerId: ANN, notice: { kind: "match_missed", rejoinAt: NOW + 120_001 } },
      { playerId: BEA, notice: { kind: "match_not_started", reason: "not_confirmed" } },
    ]);
  });

  it("puts everyone back without a wait when the site game limit stops the start", () => {
    const confirmed = valueOf(confirmMatch(MATCHED, BEA, at(1)));
    const changed = valueOf(confirmMatch(confirmed, ANN, { ...at(2), siteGamesPerDay: 0 }));
    expect(changed.starts).toEqual([]);
    expect(changed.queue.entries.map(({ playerId }) => playerId)).toEqual([ANN, BEA]);
    expect(changed.queue.rejoinWaits).toEqual([]);
    expect(changed.notices.map(({ notice }) => notice.kind)).toEqual([
      "site_game_limit",
      "site_game_limit",
    ]);
  });

  it("takes a player over their daily limit out of the queue without a wait", () => {
    const today = { ...MATCHED.lobby.today, day: Math.floor(NOW / 86_400_000) };
    const overLimit = { playerId: ANN, actions: 2000, gameStarts: 0 };
    const lobby = { ...MATCHED.lobby, today: { ...today, players: [overLimit] } };
    const confirmed = valueOf(confirmMatch({ ...MATCHED, lobby }, BEA, at(1)));
    const changed = valueOf(confirmMatch(confirmed, ANN, at(2)));
    expect(changed.queue.entries).toEqual([{ playerId: BEA, sizes: [2] }]);
    expect(changed.queue.rejoinWaits).toEqual([]);
    expect(changed.notices[0]).toEqual({
      playerId: ANN,
      notice: { kind: "daily_limit", reason: "daily_action_limit" },
    });
    expect(changed.notices[1]).toEqual({
      playerId: BEA,
      notice: { kind: "match_not_started", reason: "player_daily_limit" },
    });
    expect(queueViewFor(changed, ANN, at(3)).own).toEqual({
      kind: "out",
      rejoinAt: null,
      dailyLimit: "daily_action_limit",
    });
  });

  it("shows a confirming player that they confirmed and a decliner their rejoin wait", () => {
    const confirmed = valueOf(confirmMatch(MATCHED, BEA, at(1)));
    expect(queueViewFor(confirmed, BEA, at(2)).own).toMatchObject({ isConfirmed: true });
    expect(queueViewFor(confirmed, ANN, at(2)).own).toMatchObject({ isConfirmed: false });
    const declined = valueOf(leaveQueue(confirmed, ANN, at(3)));
    expect(queueViewFor(declined, ANN, at(4)).own).toEqual({
      kind: "out",
      rejoinAt: NOW + 120_003,
      dailyLimit: null,
    });
    expect(queueViewFor(declined, ANN, at(120_003)).own).toMatchObject({ rejoinAt: null });
  });

  it("wakes at the confirm deadline and lets the 20 seconds decide for a closed connection", () => {
    const closed = {
      ...MATCHED,
      queue: withQueueConnection(MATCHED.queue, ANN, { isConnected: false, at: NOW }),
    };
    expect(nextQueueAlarmAt(closed, CONTEXT)).toBe(NOW + 20_000);
    expect(valueOf(confirmMatch(closed, ANN, at(15_000))).queue.matches).toHaveLength(1);
  });

  it("leaves a waiting player 10 seconds after their last connection closed", () => {
    const waiting = joined({ queue: EMPTY_QUEUE, lobby: EMPTY_LOBBY }, CAT);
    const queue = withQueueConnection(waiting.queue, CAT, { isConnected: false, at: NOW });
    expect(nextQueueAlarmAt({ ...waiting, queue }, CONTEXT)).toBe(NOW + 10_000);
    const reopened = withQueueConnection(queue, CAT, { isConnected: true, at: NOW });
    expect(fireQueueAlarm({ ...waiting, queue: reopened }, at(10_000)).queue.entries).toHaveLength(
      1,
    );
    const left = fireQueueAlarm({ ...waiting, queue }, at(10_000));
    expect(left.queue.entries).toEqual([]);
    expect(left.queue.rejoinWaits).toEqual([]);
    expect(left.lobby.busy).toEqual([]);
  });
});
