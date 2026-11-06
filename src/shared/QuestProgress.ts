import type { NegativeStat } from "./NegativeStat";
import type { SeatNumber } from "./SeatNumber";

export type QuestProgress = {
  readonly seat: SeatNumber;
  readonly isCompleted: boolean;
  readonly have: ReadonlyArray<number>;
  readonly negativeStats: ReadonlyArray<NegativeStat>;
};
