import { useState } from "react";
import type { PlayerView } from "../../../shared/PlayerView";

export function useFailedVoteNotice(view: PlayerView, isStillPlaying: boolean) {
  const [lastVote, setLastVote] = useState(view.vote);
  const [nextVoteTurn, setNextVoteTurn] = useState<number | null>(null);
  if (view.vote !== lastVote) {
    setLastVote(view.vote);
    const hasFailed =
      isStillPlaying && lastVote !== null && view.vote === null && view.result === null;
    setNextVoteTurn(hasFailed ? view.nextVoteTurn : null);
  }
  return {
    failedVoteNextTurn: nextVoteTurn,
    dismissFailedVote: () => {
      setNextVoteTurn(null);
    },
  };
}
