import type { PlayerId } from "../../shared/PlayerId";
import type { SeatNumber } from "../../shared/SeatNumber";

export type SeatPlayer = {
  readonly seat: SeatNumber;
  readonly playerId: PlayerId;
  readonly stateVersion: number;
  readonly acceptedActionIds: ReadonlyArray<string>;
};
