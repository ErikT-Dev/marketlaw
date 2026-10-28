import type { PlayerId } from "../../shared/PlayerId";
import type { RoomRecord } from "./RoomRecord";
import { updateFor } from "./updateFor";

export function playersWhoseUpdateChanged(
  before: RoomRecord,
  after: RoomRecord,
): ReadonlyArray<PlayerId> {
  return after.players
    .map(({ playerId }) => playerId)
    .filter(
      (playerId) =>
        JSON.stringify(updateFor(before, playerId)) !== JSON.stringify(updateFor(after, playerId)),
    );
}
