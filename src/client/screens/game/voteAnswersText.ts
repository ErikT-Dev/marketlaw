import type { VoteView } from "../../../shared/VoteView";

export function voteAnswersText(vote: VoteView): string {
  const players = vote.of === 1 ? "player" : "players";
  return `${String(vote.answered)} of ${String(vote.of)} ${players} answered`;
}
