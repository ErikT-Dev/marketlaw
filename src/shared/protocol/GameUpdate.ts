import type { PlayerView } from "../PlayerView";
import type { SeatNumber } from "../SeatNumber";

export type GameUpdate = {
  readonly stateVersion: number;
  readonly view: PlayerView;
  readonly awaySeats: ReadonlyArray<SeatNumber>;
};
