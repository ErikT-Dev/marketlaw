import type { CardName } from "./catalogue/CardName";
import type { SeatNumber } from "./SeatNumber";
import type { Stats } from "./Stats";

export type OwnSeatView = {
  readonly kind: "own";
  readonly seat: SeatNumber;
  readonly stats: Stats;
  readonly hand: ReadonlyArray<CardName>;
  readonly city: ReadonlyArray<CardName>;
  readonly buildPasses: number;
  readonly hasPlayedThisTurn: boolean;
  readonly hasSkippedBuild: boolean;
  readonly actionsThisTurn: number;
  readonly isDone: boolean;
  readonly hasLeft: boolean;
  readonly timeBankMs: number;
};
