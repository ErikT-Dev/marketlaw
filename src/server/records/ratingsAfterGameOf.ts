import { endedGameOf } from "../replays/endedGameOf";
import type { RoomRecord } from "../room/RoomRecord";
import type { PlayerRating } from "./PlayerRating";
import { storedGameRecordOf } from "./storedGameRecordOf";

export function ratingsAfterGameOf(
  before: RoomRecord | null,
  after: RoomRecord | null,
): ReadonlyArray<PlayerRating> {
  const game = after?.game ?? null;
  if (game === null || endedGameOf(before, after) === null) {
    return [];
  }
  return (storedGameRecordOf(game)?.players ?? []).flatMap(({ playerId, rating }) =>
    rating === null ? [] : [{ playerId, rating: rating.before + rating.change }],
  );
}
