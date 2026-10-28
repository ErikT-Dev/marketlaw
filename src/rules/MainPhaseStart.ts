import type { CardName } from "../shared/catalogue/CardName";
import type { SeatState } from "./SeatState";

export type MainPhaseStart = {
  readonly seats: ReadonlyArray<SeatState>;
  readonly deck: ReadonlyArray<CardName>;
  readonly discard: ReadonlyArray<CardName>;
  readonly drawLogLength: number;
};
