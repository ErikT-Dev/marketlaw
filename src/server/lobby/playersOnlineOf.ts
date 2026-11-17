import type { PlayerOnlineView } from "../../shared/protocol/PlayerOnlineView";
import { nameKeyOf } from "../accounts/nameKeyOf";
import { isInGame } from "./isInGame";
import type { LobbyRecord } from "./LobbyRecord";
import type { OnlineConnection } from "./OnlineConnection";

function sortKeyOf(player: PlayerOnlineView): string {
  return `${nameKeyOf(player.username)}\u0000${player.playerId}`;
}

function byUsername(first: PlayerOnlineView, second: PlayerOnlineView): number {
  const firstKey = sortKeyOf(first);
  const secondKey = sortKeyOf(second);
  if (firstKey === secondKey) {
    return 0;
  }
  return firstKey < secondKey ? -1 : 1;
}

export function playersOnlineOf(
  record: LobbyRecord,
  connections: ReadonlyArray<OnlineConnection>,
): ReadonlyArray<PlayerOnlineView> {
  const byPlayer = new Map(connections.map((connection) => [connection.playerId, connection]));
  return [...byPlayer.values()]
    .map(({ playerId, username, rating }): PlayerOnlineView => ({
      playerId,
      username,
      rating,
      status: isInGame(record, playerId) ? "in_game" : "online",
    }))
    .sort(byUsername);
}
