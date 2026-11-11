import type { RecordName } from "../../shared/api/RecordName";
import type { PlayerId } from "../../shared/PlayerId";

export function recordNameOf(
  playerId: PlayerId,
  usernames: ReadonlyMap<PlayerId, string>,
): RecordName {
  const username = usernames.get(playerId);
  return username === undefined ? { kind: "deleted" } : { kind: "player", playerId, username };
}
