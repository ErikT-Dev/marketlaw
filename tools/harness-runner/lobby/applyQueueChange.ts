import type { QueueChange } from "../../../src/server/queue/QueueChange.ts";
import type { LobbySession } from "./LobbySession.ts";
import { startRankedRoomsInLobby } from "./startRankedRoomsInLobby.ts";

export function applyQueueChange(session: LobbySession, change: QueueChange): void {
  session.queue = change.queue;
  session.lobby = change.lobby;
  const started = startRankedRoomsInLobby(session, change.starts);
  for (const { playerId, notice } of [...change.notices, ...started]) {
    const name = [...session.accounts.values()].find(
      ({ identity }) => identity.playerId === playerId,
    )?.identity.name;
    if (name !== undefined) {
      session.queueNoticesTo.set(name, [...(session.queueNoticesTo.get(name) ?? []), notice]);
    }
  }
}
