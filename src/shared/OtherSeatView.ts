import type { CardName } from "./catalogue/CardName";
import type { SeatNumber } from "./SeatNumber";
import type { Stats } from "./Stats";

export type OtherSeatView = {
  readonly kind: "other";
  readonly seat: SeatNumber;
  readonly stats: Stats;
  readonly handCount: number;
  readonly city: ReadonlyArray<CardName>;
  readonly buildPasses: number;
  readonly isDone: boolean;
  readonly hasLeft: boolean;
  readonly timeBankMs: number;
};
