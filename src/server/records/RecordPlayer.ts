import type { PlayerId } from "../../shared/PlayerId";
import type { SeatNumber } from "../../shared/SeatNumber";

export type RecordPlayer = {
  readonly seat: SeatNumber;
  readonly playerId: PlayerId;
};
