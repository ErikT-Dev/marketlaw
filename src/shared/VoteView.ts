import type { EpochMs } from "./EpochMs";
import type { SeatNumber } from "./SeatNumber";

export type VoteView = {
  readonly caller: SeatNumber;
  readonly deadline: EpochMs;
  readonly answered: number;
  readonly of: number;
  readonly hasToAnswer: boolean;
};
