import type { PlayerId } from "../../shared/PlayerId";
import type { SeatNumber } from "../../shared/SeatNumber";
import type { RecordRating } from "./RecordRating";

export type RecordPlayer = {
  readonly seat: SeatNumber;
  readonly playerId: PlayerId;
  readonly rating: RecordRating | null;
};
