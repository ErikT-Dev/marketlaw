import { changeQueueSizes } from "../../../src/server/queue/changeQueueSizes.ts";
import { joinQueue } from "../../../src/server/queue/joinQueue.ts";
import { leaveQueue } from "../../../src/server/queue/leaveQueue.ts";
import type { QueueJoiner } from "../../../src/server/queue/QueueJoiner.ts";
import { applyQueueChange } from "./applyQueueChange.ts";
import type { LobbySession } from "./LobbySession.ts";
import { queueContextIn } from "./queueContextIn.ts";

function joinerNamed(session: LobbySession, name: string): QueueJoiner {
  const { playerId } = session.identityNamed(name);
  const registration = session.accounts.get(name)?.registration ?? null;
  if (registration === null) {
    return { playerId, standing: "guest" };
  }
  return {
    playerId,
    standing: registration.isEmailConfirmed ? "email_confirmed" : "email_not_confirmed",
  };
}

function sizesOfStep(step: Readonly<Record<string, unknown>>): ReadonlyArray<number> | null {
  const sizes: unknown = step["sizes"];
  if (sizes === undefined) {
    return null;
  }
  return Array.isArray(sizes) ? sizes.map(Number) : [];
}

function changeOfStep(
  session: LobbySession,
  name: string,
  step: Readonly<Record<string, unknown>>,
) {
  const state = { queue: session.queue, lobby: session.lobby };
  const context = queueContextIn(session);
  const { playerId } = session.identityNamed(name);
  switch (step["action"]) {
    case "join_queue":
      return joinQueue(state, joinerNamed(session, name), sizesOfStep(step), context);
    case "change_sizes":
      return changeQueueSizes(state, playerId, sizesOfStep(step) ?? [], context);
    default: {
      const left = leaveQueue(state, playerId);
      return left.isOk ? { isOk: true as const, value: { ...left.value, notices: [] } } : left;
    }
  }
}

export function runQueueStep(
  session: LobbySession,
  name: string,
  step: Readonly<Record<string, unknown>>,
): void {
  const changed = changeOfStep(session, name, step);
  if (!changed.isOk) {
    session.rejected = changed.error;
    return;
  }
  applyQueueChange(session, changed.value);
  if (step["action"] === "join_queue") {
    session.leaveFinishedRoom(session.identityNamed(name).playerId);
  }
}
