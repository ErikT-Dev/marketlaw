import type { SeatNumber } from "../../../shared/SeatNumber";
import type { PlayerStatus } from "../../components/PlayerStatus";

export type OrderBadge = {
  readonly seat: SeatNumber;
  readonly name: string;
  readonly status: PlayerStatus;
  readonly isFirstPlayer: boolean;
};
