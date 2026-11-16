import type { HandCardDetails } from "../../../shared/HandCardDetails";
import type { OwnSeatView } from "../../../shared/OwnSeatView";
import type { LookedAtCard } from "./LookedAtCard";
import { LookedAtCardPanel } from "./LookedAtCardPanel";
import { SelectedCardPanel } from "./SelectedCardPanel";
import styles from "./SelectedCardPanel.module.css";

type Props = {
  readonly details: HandCardDetails | undefined;
  readonly lookedAt: LookedAtCard | null;
  readonly seat: OwnSeatView;
  readonly nextVoteTurn: number;
  readonly isBusy: boolean;
  readonly isOverStatsAndHand: boolean;
  readonly onPlay: () => void;
  readonly onClose: () => void;
  readonly onLookAt: (lookedAt: LookedAtCard | null) => void;
};

export function BigCardBesideHand(props: Props) {
  const { details, lookedAt, onLookAt } = props;
  const className = styles[props.isOverStatsAndHand ? "overStatsAndHand" : "besideHand"];
  if (details !== undefined) {
    return (
      <SelectedCardPanel
        details={details}
        seat={props.seat}
        nextVoteTurn={props.nextVoteTurn}
        isBusy={props.isBusy}
        onPlay={props.onPlay}
        onClose={props.onClose}
        className={className}
      />
    );
  }
  if (lookedAt === null) {
    return null;
  }
  return (
    <LookedAtCardPanel
      card={lookedAt.card}
      className={className}
      onClose={() => {
        onLookAt(null);
      }}
    />
  );
}
