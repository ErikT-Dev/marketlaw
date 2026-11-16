import type { CardName } from "../shared/catalogue/CardName";
import type { SeatNumber } from "../shared/SeatNumber";

export type SeatPilesAtStart = {
  readonly seat: SeatNumber;
  readonly deckCount: number;
  readonly kindTierCounts: Readonly<Record<string, number>>;
  readonly discard: ReadonlyArray<CardName>;
  readonly drawLogLength: number;
};
