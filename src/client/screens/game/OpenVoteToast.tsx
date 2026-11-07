import type { VoteView } from "../../../shared/VoteView";
import { clockText } from "../../components/clockText";
import { Toast } from "../../components/Toast";
import { useServerNow } from "./useServerNow";
import { voteAnswersText } from "./voteAnswersText";

type Props = {
  readonly vote: VoteView;
  readonly callerName: string;
};

export function OpenVoteToast({ vote, callerName }: Props) {
  const now = useServerNow();
  return (
    <Toast
      kind="info"
      title="Vote to abandon the game"
      text={`${callerName} called a vote. ${voteAnswersText(vote)}, ${clockText(vote.deadline - now)} left.`}
      onClose={null}
    />
  );
}
