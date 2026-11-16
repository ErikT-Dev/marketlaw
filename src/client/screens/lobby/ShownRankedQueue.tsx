import { useEffect, useRef, useState } from "react";
import type { QueueView } from "../../../shared/protocol/QueueView";
import type { RankedGameSize } from "../../../shared/RankedGameSize";
import type { ReasonCode } from "../../../shared/ReasonCode";
import type { IconText } from "../../components/IconText";
import type { AccountBinding } from "../account/AccountBinding";
import { REJECTION_MESSAGES } from "../game/REJECTION_MESSAGES";
import { MatchFoundDialog } from "./MatchFoundDialog";
import type { RankedQueueBinding } from "./RankedQueueBinding";
import { RankedQueuePanel } from "./RankedQueuePanel";
import { rankedLockOf } from "./rankedLockOf";
import { rankedRejectionText } from "./rankedRejectionText";
import { toggledGameSizes } from "./toggledGameSizes";
import { useGameSizeChoice } from "./useGameSizeChoice";
import { useRankedStanding } from "./useRankedStanding";

type Props = {
  readonly queue: QueueView;
  readonly account: AccountBinding | null;
  readonly ranked: RankedQueueBinding;
  readonly now: number;
};

function useResyncOnLogin(playerId: string | null, resync: () => void): void {
  const seenPlayerId = useRef(playerId);
  useEffect(() => {
    if (seenPlayerId.current !== playerId) {
      seenPlayerId.current = playerId;
      resync();
    }
  }, [playerId, resync]);
}

export function ShownRankedQueue({ account, ranked, now, queue }: Props) {
  const { onIntent } = ranked;
  const standing = useRankedStanding(account, ranked.standingCheck);
  const choice = useGameSizeChoice();
  const [sendAgainText, setSendAgainText] = useState<IconText | null>(null);
  useResyncOnLogin(account?.playerId ?? null, ranked.onResync);
  const { own } = queue;
  const sizes = own.kind === "waiting" ? own.sizes : choice.sizes;
  const rejoinAt = own.kind === "out" ? own.rejoinAt : null;
  const rejection =
    ranked.rejection === null ? null : rankedRejectionText(ranked.rejection, rejoinAt, now);
  async function sendConfirmationAgain(send: () => Promise<ReasonCode | null>) {
    const problem = await send();
    setSendAgainText(problem === null ? "We sent the link again." : REJECTION_MESSAGES[problem]);
  }
  return (
    <>
      <RankedQueuePanel
        queue={queue}
        sizes={sizes}
        lock={rankedLockOf(standing, own, now)}
        error={rejection ?? sendAgainText}
        onToggle={(size: RankedGameSize) => {
          choice.choose(toggledGameSizes(sizes, size));
          if (own.kind === "waiting") {
            onIntent({ type: "change_sizes", sizes: toggledGameSizes(sizes, size) });
          }
        }}
        onJoin={() => {
          onIntent({ type: "join_queue", sizes: choice.sizes });
        }}
        onLeave={() => {
          onIntent({ type: "leave_queue" });
        }}
        onSendConfirmationAgain={() => {
          if (account !== null) {
            void sendConfirmationAgain(account.onSendConfirmationAgain);
          }
        }}
      />
      {own.kind === "confirming" ? (
        <MatchFoundDialog
          size={own.size}
          timeLeftMs={own.deadline - now}
          isConfirmed={own.isConfirmed}
          error={rejection}
          onConfirm={() => {
            onIntent({ type: "confirm_match" });
          }}
          onDecline={() => {
            onIntent({ type: "decline_match" });
          }}
        />
      ) : null}
    </>
  );
}
