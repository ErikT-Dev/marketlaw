import type { RankedStart } from "../../../src/server/queue/RankedStart.ts";
import type { PlayerId } from "../../../src/shared/PlayerId.ts";
import type { RankedGameSize } from "../../../src/shared/RankedGameSize.ts";
import { BUSY_DAY } from "./BUSY_DAY.ts";
import type { BusyDayQueue } from "./BusyDayQueue.ts";
import { QUEUE_TIMES } from "../../../src/server/queue/QUEUE_TIMES.ts";

type Clock = { now: number };

function joinWithOtherSize(
  queue: BusyDayQueue,
  clock: Clock,
  playerId: PlayerId,
  size: RankedGameSize,
): void {
  const unmatchableSizes = size === 4 ? [2] : [4];
  clock.now += BUSY_DAY.queueMessageMs;
  queue.send(
    { kind: "join", joiner: { playerId, standing: "email_confirmed" }, sizes: unmatchableSizes },
    clock.now,
  );
  clock.now += BUSY_DAY.queueMessageMs;
  queue.send({ kind: "change_sizes", playerId, sizes: [size] }, clock.now);
}

function declineAndJoinAgain(
  queue: BusyDayQueue,
  clock: Clock,
  playerId: PlayerId,
  size: RankedGameSize,
): void {
  clock.now += BUSY_DAY.queueMessageMs;
  queue.send({ kind: "decline", playerId }, clock.now);
  clock.now += QUEUE_TIMES.rejoinWaitMs;
  queue.send(
    { kind: "join", joiner: { playerId, standing: "email_confirmed" }, sizes: [size] },
    clock.now,
  );
}

export function matchThroughQueue(
  queue: BusyDayQueue,
  clock: Clock,
  match: {
    readonly players: ReadonlyArray<PlayerId>;
    readonly size: RankedGameSize;
    readonly isDeclinedOnce: boolean;
  },
): RankedStart {
  match.players.forEach((playerId) => {
    joinWithOtherSize(queue, clock, playerId, match.size);
  });
  const decliner = match.players.at(-1);
  if (match.isDeclinedOnce && decliner !== undefined) {
    declineAndJoinAgain(queue, clock, decliner, match.size);
  }
  const starts = match.players.flatMap((playerId) => {
    clock.now += BUSY_DAY.queueMessageMs;
    return queue.send({ kind: "confirm", playerId }, clock.now).starts;
  });
  const [start] = starts;
  if (start === undefined || starts.length !== 1) {
    throw new Error(`the busy day's ranked match of ${String(match.size)} did not start once`);
  }
  return start;
}
