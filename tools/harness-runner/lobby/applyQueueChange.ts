import type { QueueChange } from "../../../src/server/queue/QueueChange.ts";
import type { LobbySession } from "./LobbySession.ts";

export function applyQueueChange(session: LobbySession, change: QueueChange): void {
  session.queue = change.queue;
  session.lobby = change.lobby;
  for (const { playerId, notice } of change.notices) {
    const name = [...session.accounts.values()].find(
      ({ identity }) => identity.playerId === playerId,
    )?.identity.name;
    if (name !== undefined) {
      session.queueNoticesTo.set(name, [...(session.queueNoticesTo.get(name) ?? []), notice]);
    }
  }
}
