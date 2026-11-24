import { cardOf } from "../../../shared/catalogue/cardOf";
import type { HandCardDetails } from "../../../shared/HandCardDetails";
import type { OwnSeatView } from "../../../shared/OwnSeatView";
import { BigCard } from "../../components/BigCard";
import { StatChip } from "../../components/StatChip";
import { TextWithIcons } from "../../components/TextWithIcons";
import { cardNameCombosShownOf } from "./cardNameCombosShownOf";
import { combosReadyOnPlayOf } from "./combosReadyOnPlayOf";
import { costExplanation } from "./costExplanation";
import { rejectionMessage } from "./rejectionMessage";
import { SelectedCardButtons } from "./SelectedCardButtons";
import styles from "./SelectedCardPanel.module.css";

type Props = {
  readonly details: HandCardDetails;
  readonly seat: OwnSeatView;
  readonly nextVoteTurn: number;
  readonly isBusy: boolean;
  readonly onPlay: () => void;
  readonly onSell: () => void;
  readonly onClose: () => void;
  readonly className: string | undefined;
};

export function SelectedCardPanel(props: Props) {
  const { details, seat, nextVoteTurn, isBusy, onPlay, onSell, onClose, className } = props;
  const card = cardOf(details.card);
  const rejection = details.playRejection;
  return (
    <section className={className} aria-label={`Selected card: ${card.name}`} data-big-card>
      <BigCard
        card={card}
        realCost={details.realCost}
        cardNameCombos={cardNameCombosShownOf(card.name, seat)}
        comboReadyTimesOnPlay={combosReadyOnPlayOf(card.name, seat)}
      />
      <h3 className={styles["cost"]}>
        Costs <StatChip stat="funds" value={details.realCost} />
      </h3>
      <p className={styles["explanation"]}>{costExplanation(card, details)}</p>
      {rejection === null ? null : (
        <p className={styles["reason"]}>
          <TextWithIcons
            text={rejectionMessage(
              { action: { type: "play_card", card: card.name }, code: rejection },
              seat,
              nextVoteTurn,
            )}
          />
        </p>
      )}
      <SelectedCardButtons
        key={card.name}
        canPlay={rejection === null && !isBusy}
        canSell={seat.sellRejection === null && !isBusy}
        onPlay={onPlay}
        onSell={onSell}
        onClose={onClose}
      />
    </section>
  );
}
