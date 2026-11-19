import { cardOf } from "../../../shared/catalogue/cardOf";
import type { HandCardDetails } from "../../../shared/HandCardDetails";
import type { OwnSeatView } from "../../../shared/OwnSeatView";
import { BigCard } from "../../components/BigCard";
import { Button } from "../../components/Button";
import { StatChip } from "../../components/StatChip";
import { TextWithIcons } from "../../components/TextWithIcons";
import { cardNameCombosShownOf } from "./cardNameCombosShownOf";
import { costExplanation } from "./costExplanation";
import { rejectionMessage } from "./rejectionMessage";
import styles from "./SelectedCardPanel.module.css";

type Props = {
  readonly details: HandCardDetails;
  readonly seat: OwnSeatView;
  readonly nextVoteTurn: number;
  readonly isBusy: boolean;
  readonly onPlay: () => void;
  readonly onClose: () => void;
  readonly className: string | undefined;
};

export function SelectedCardPanel(props: Props) {
  const { details, seat, nextVoteTurn, isBusy, onPlay, onClose, className } = props;
  const card = cardOf(details.card);
  const rejection = details.playRejection;
  return (
    <section className={className} aria-label={`Selected card: ${card.name}`}>
      <BigCard
        card={card}
        realCost={details.realCost}
        cardNameCombos={cardNameCombosShownOf(card.name, seat)}
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
      <div className={styles["buttons"]}>
        <Button look="secondary" onClick={onClose}>
          Close
        </Button>
        <Button look="menu" isDisabled={rejection !== null || isBusy} onClick={onPlay}>
          Play card
        </Button>
      </div>
    </section>
  );
}
