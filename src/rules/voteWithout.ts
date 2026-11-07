import type { SeatNumber } from "../shared/SeatNumber";
import type { OpenVote } from "./OpenVote";

export function voteWithout(vote: OpenVote | null, leaver: SeatNumber): OpenVote | null {
  return vote === null
    ? null
    : {
        ...vote,
        asked: vote.asked.filter((seat) => seat !== leaver),
        ballots: vote.ballots.filter(({ seat }) => seat !== leaver),
      };
}
