import type { SeatNumber } from "../shared/SeatNumber";
import type { VoteBallot } from "./VoteBallot";

export type OpenVote = {
  readonly caller: SeatNumber;
  readonly asked: ReadonlyArray<SeatNumber>;
  readonly ballots: ReadonlyArray<VoteBallot>;
  readonly deadline: number;
};
