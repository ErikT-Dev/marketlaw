import type { SeatNumber } from "../shared/SeatNumber";
import type { VoteAnswer } from "../shared/VoteAnswer";

export type VoteBallot = {
  readonly seat: SeatNumber;
  readonly answer: VoteAnswer;
};
