import type { PlayerView } from "../../../shared/PlayerView";
import type { ActionIntent } from "../../../shared/protocol/ActionIntent";
import type { PendingAction } from "../../store/PendingAction";
import { AnswerVoteDialog } from "./AnswerVoteDialog";
import { playerNameOf } from "./playerNameOf";

type Props = {
  readonly view: PlayerView;
  readonly playerNames: ReadonlyArray<string>;
  readonly pendingActions: ReadonlyArray<PendingAction>;
  readonly onAction: (action: ActionIntent) => void;
};

export function AnswerVoteDialogIfAsked({ view, playerNames, pendingActions, onAction }: Props) {
  const vote = view.vote;
  const isAnswerPending = pendingActions.some((pending) => pending.action.type === "vote");
  if (vote === null || !vote.hasToAnswer || isAnswerPending) {
    return null;
  }
  return (
    <AnswerVoteDialog
      vote={vote}
      callerName={playerNameOf(playerNames, vote.caller)}
      onAnswer={(answer) => {
        onAction({ type: "vote", vote: answer });
      }}
    />
  );
}
