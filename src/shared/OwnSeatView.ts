import type { CardName } from "./catalogue/CardName";
import type { HandCardDetails } from "./HandCardDetails";
import type { SeatNumber } from "./SeatNumber";
import type { Stats } from "./Stats";

export type OwnSeatView = {
  readonly kind: "own";
  readonly seat: SeatNumber;
  readonly stats: Stats;
  readonly hand: ReadonlyArray<CardName>;
  readonly handDetails: ReadonlyArray<HandCardDetails>;
  readonly city: ReadonlyArray<CardName>;
  readonly buildPasses: number;
  readonly hasPlayedThisTurn: boolean;
  readonly hasSkippedBuild: boolean;
  readonly actionsThisTurn: number;
  readonly isDone: boolean;
  readonly hasLeft: boolean;
  readonly timeBankMs: number;
};
