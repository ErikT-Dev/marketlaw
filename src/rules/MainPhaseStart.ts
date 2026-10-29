import type { CardName } from "../shared/catalogue/CardName";
import type { SeatState } from "./SeatState";

export type MainPhaseStart = {
  readonly seats: ReadonlyArray<SeatState>;
  readonly deckCount: number;
  readonly kindTierCounts: Readonly<Record<string, number>>;
  readonly discard: ReadonlyArray<CardName>;
  readonly drawLogLength: number;
};
