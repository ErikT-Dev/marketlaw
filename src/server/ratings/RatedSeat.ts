import type { SeatNumber } from "../../shared/SeatNumber";
import type { RatingBeforeGame } from "./RatingBeforeGame";

export type RatedSeat = RatingBeforeGame & {
  readonly seat: SeatNumber;
  readonly place: number;
};
