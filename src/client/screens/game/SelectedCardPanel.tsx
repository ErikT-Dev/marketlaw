import { cardOf } from "../../../shared/catalogue/cardOf";
import type { HandCardDetails } from "../../../shared/HandCardDetails";
import type { OwnSeatView } from "../../../shared/OwnSeatView";
import { BigCard } from "../../components/BigCard";
import { Button } from "../../components/Button";
import { StatChip } from "../../components/StatChip";
import { TextWithIcons } from "../../components/TextWithIcons";
import { costExplanation } from "./costExplanation";
import { rejectionMessage } from "./rejectionMessage";
import styles from "./SelectedCardPanel.module.css";

type Props = {
  readonly details: HandCardDetails;
  readonly seat: OwnSeatView;
  readonly isBusy: boolean;
  readonly onPlay: () => void;
  readonly onClose: () => void;
};

export function SelectedCardPanel({ details, seat, isBusy, onPlay, onClose }: Props) {
  const card = cardOf(details.card);
  const rejection = details.playRejection;
  return (
    <section className={styles["selected"]} aria-label={`Selected card: ${card.name}`}>
      <BigCard card={card} realCost={details.realCost} />
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
