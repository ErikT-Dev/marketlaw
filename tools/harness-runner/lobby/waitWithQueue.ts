import { matchQueue } from "../../../src/server/queue/matchQueue.ts";
import { nextQueueAlarmAt } from "../../../src/server/queue/nextQueueAlarmAt.ts";
import { applyQueueChange } from "./applyQueueChange.ts";
import type { LobbySession } from "./LobbySession.ts";
import { queueContextIn } from "./queueContextIn.ts";

export function waitWithQueue(session: LobbySession, ms: number): void {
  const alarm = nextQueueAlarmAt(
    { queue: session.queue, lobby: session.lobby },
    queueContextIn(session),
  );
  session.wait(ms);
  if (alarm !== null && alarm <= session.now) {
    const state = { queue: session.queue, lobby: session.lobby };
    applyQueueChange(session, matchQueue(state, queueContextIn({ now: alarm })));
  }
}
