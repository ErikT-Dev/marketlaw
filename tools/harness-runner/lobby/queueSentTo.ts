import { queueViewFor } from "../../../src/server/queue/queueViewFor.ts";
import type { LobbySession } from "./LobbySession.ts";
import { queueContextIn } from "./queueContextIn.ts";
import type { QueueSent } from "./QueueSent.ts";

export function queueSentTo(session: LobbySession, name: string): QueueSent {
  const state = { queue: session.queue, lobby: session.lobby };
  const playerId = session.accounts.get(name)?.identity.playerId ?? null;
  return {
    notices: session.queueNoticesTo.get(name) ?? [],
    view: queueViewFor(state, playerId, queueContextIn(session)),
    memberIds: [
      ...session.queue.entries,
      ...session.queue.matches.flatMap(({ players }) => players),
    ].map((entry) => entry.playerId),
  };
}
