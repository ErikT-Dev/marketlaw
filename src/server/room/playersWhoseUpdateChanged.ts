import type { PlayerId } from "../../shared/PlayerId";
import type { RoomRecord } from "./RoomRecord";
import { updateFor } from "./updateFor";
import { updateTextOf } from "./updateTextOf";

export function playersWhoseUpdateChanged(
  before: RoomRecord,
  after: RoomRecord,
): ReadonlyArray<PlayerId> {
  return after.players
    .map(({ playerId }) => playerId)
    .filter(
      (playerId) =>
        updateTextOf(updateFor(before, playerId)) !== updateTextOf(updateFor(after, playerId)),
    );
}
