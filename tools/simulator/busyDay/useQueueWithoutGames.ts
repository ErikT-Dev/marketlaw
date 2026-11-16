import { QUEUE_TIMES } from "../../../src/server/queue/QUEUE_TIMES.ts";
import type { PlayerId } from "../../../src/shared/PlayerId.ts";
import { BUSY_DAY } from "./BUSY_DAY.ts";
import { busyDayPlayer } from "./busyDayPlayer.ts";
import type { BusyDayQueue } from "./BusyDayQueue.ts";
const WAIT_IN_QUEUE_MS = 60_000;

function leaveQueueWithoutGame(
  queue: BusyDayQueue,
  clock: { now: number },
  leaving: { readonly playerId: PlayerId; readonly isByClosedConnection: boolean },
): void {
  const { playerId } = leaving;
  clock.now += BUSY_DAY.queueMessageMs;
  queue.send(
    { kind: "join", joiner: { playerId, standing: "email_confirmed" }, sizes: null },
    clock.now,
  );
  clock.now += WAIT_IN_QUEUE_MS;
  if (leaving.isByClosedConnection) {
    queue.send({ kind: "connection", playerId, isConnected: false }, clock.now);
    clock.now += QUEUE_TIMES.closedConnectionLeaveMs;
    queue.fireAlarmsUntil(clock.now);
  } else {
    queue.send({ kind: "leave", playerId }, clock.now);
  }
}

export function useQueueWithoutGames(queue: BusyDayQueue, clock: { now: number }): void {
  const leavers = BUSY_DAY.queueLeavers + BUSY_DAY.queueClosedConnections;
  for (let leaver = 0; leaver < leavers; leaver += 1) {
    const { playerId } = busyDayPlayer(BUSY_DAY.games + leaver, 0);
    leaveQueueWithoutGame(queue, clock, {
      playerId,
      isByClosedConnection: leaver >= BUSY_DAY.queueLeavers,
    });
  }
}
