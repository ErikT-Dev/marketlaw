import * as v from "valibot";
import { siteGameLimitOf } from "../../../src/server/lobby/siteGameLimitOf.ts";
import { applyQueueOperation } from "../../../src/server/queue/applyQueueOperation.ts";
import { EMPTY_QUEUE } from "../../../src/server/queue/EMPTY_QUEUE.ts";
import { nextQueueAlarmAt } from "../../../src/server/queue/nextQueueAlarmAt.ts";
import type { QueueChange } from "../../../src/server/queue/QueueChange.ts";
import type { QueueContext } from "../../../src/server/queue/QueueContext.ts";
import type { QueueOperation } from "../../../src/server/queue/QueueOperation.ts";
import type { QueueRecord } from "../../../src/server/queue/QueueRecord.ts";
import { EpochMs } from "../../../src/shared/EpochMs.ts";
import type { BusyDayCounter } from "./BusyDayCounter.ts";

const TOKEN_QUEUE_AND_LOBBY_READS_PER_MESSAGE = 4;
const BUSY_CHECK_AND_ACCOUNT_READS_PER_JOIN = 3;
const QUEUE_AND_LOBBY_READS_PER_ALARM = 2;

function contextAt(now: number): QueueContext {
  return { now: v.parse(EpochMs, now), siteGamesPerDay: siteGameLimitOf({}) };
}

export class BusyDayQueue {
  private queue: QueueRecord = EMPTY_QUEUE;
  private alarm: number | null = null;

  private readonly counter: BusyDayCounter;

  constructor(counter: BusyDayCounter) {
    this.counter = counter;
  }

  send(operation: QueueOperation, now: number): QueueChange {
    this.fireAlarmsUntil(now);
    this.counter.countReads(
      TOKEN_QUEUE_AND_LOBBY_READS_PER_MESSAGE +
        (operation.kind === "join" ? BUSY_CHECK_AND_ACCOUNT_READS_PER_JOIN : 0),
    );
    return this.apply(operation, now);
  }

  fireAlarmsUntil(until: number): void {
    for (let alarm = this.alarm; alarm !== null && alarm <= until; alarm = this.alarm) {
      this.counter.countReads(QUEUE_AND_LOBBY_READS_PER_ALARM);
      this.alarm = null;
      this.apply({ kind: "alarm" }, alarm);
    }
  }

  private apply(operation: QueueOperation, now: number): QueueChange {
    const context = contextAt(now);
    const outcome = applyQueueOperation(
      { queue: this.queue, lobby: this.counter.lobby },
      operation,
      context,
    );
    if (outcome.rejection !== null) {
      throw new Error(`the busy day's queue rejected ${operation.kind}: ${outcome.rejection}`);
    }
    const { change } = outcome;
    this.counter.changeLobby(change.lobby);
    if (JSON.stringify(change.queue) !== JSON.stringify(this.queue)) {
      this.queue = change.queue;
      this.counter.count("queue");
    }
    const next = nextQueueAlarmAt(change, context);
    if (next !== this.alarm) {
      this.alarm = next;
      this.counter.count("alarm");
    }
    return change;
  }
}
