import type { SeatNumber } from "./SeatNumber";

export type QuestProgress = {
  readonly seat: SeatNumber;
  readonly isCompleted: boolean;
  readonly have: ReadonlyArray<number>;
};
