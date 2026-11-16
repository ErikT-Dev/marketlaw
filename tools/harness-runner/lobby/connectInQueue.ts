import { withQueueConnection } from "../../../src/server/queue/withQueueConnection.ts";
import type { LobbySession } from "./LobbySession.ts";

export function connectInQueue(session: LobbySession, name: string, isConnected: boolean): void {
  session.setConnected(name, isConnected);
  const { playerId } = session.identityNamed(name);
  session.queue = withQueueConnection(session.queue, playerId, { isConnected, at: session.now });
}
