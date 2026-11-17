import type { SeatRatingView } from "../../shared/protocol/SeatRatingView";
import { storedGameRecordOf } from "../records/storedGameRecordOf";
import type { RoomGame } from "./RoomGame";

export function seatRatingsOf(game: RoomGame | null): ReadonlyArray<SeatRatingView> | null {
  if (game === null || game.kind === "casual") {
    return null;
  }
  const record = storedGameRecordOf(game);
  if (record === null) {
    return null;
  }
  return record.players.flatMap(({ seat, rating }) =>
    rating === null ? [] : [{ seat, before: rating.before, after: rating.before + rating.change }],
  );
}
