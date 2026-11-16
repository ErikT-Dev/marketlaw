import * as v from "valibot";
import { fireQueueAlarm } from "../../../src/server/queue/fireQueueAlarm.ts";
import { nextQueueAlarmAt } from "../../../src/server/queue/nextQueueAlarmAt.ts";
import { EpochMs } from "../../../src/shared/EpochMs.ts";
import { applyQueueChange } from "./applyQueueChange.ts";
import type { LobbySession } from "./LobbySession.ts";
import { queueContextIn } from "./queueContextIn.ts";

function nextAlarmIn(session: LobbySession): EpochMs | null {
  return nextQueueAlarmAt({ queue: session.queue, lobby: session.lobby }, queueContextIn(session));
}

export function waitWithQueue(session: LobbySession, ms: number): void {
  const until = v.parse(EpochMs, session.now + ms);
  let fired: EpochMs | null = null;
  for (
    let alarm = nextAlarmIn(session);
    alarm !== null && alarm <= until && alarm !== fired;
    alarm = nextAlarmIn(session)
  ) {
    session.wait(Math.max(0, alarm - session.now));
    const state = { queue: session.queue, lobby: session.lobby };
    applyQueueChange(session, fireQueueAlarm(state, queueContextIn({ now: alarm })));
    fired = alarm;
  }
  session.wait(until - session.now);
}
