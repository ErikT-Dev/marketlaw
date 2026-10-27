import type { Piles } from "./Piles";
import type { SeatState } from "./SeatState";

export type SeatsDealt = {
  readonly seats: ReadonlyArray<SeatState>;
  readonly piles: Piles;
};
