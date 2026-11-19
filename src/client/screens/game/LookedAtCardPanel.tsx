import type { CardName } from "../../../shared/catalogue/CardName";
import { cardOf } from "../../../shared/catalogue/cardOf";
import { BigCard } from "../../components/BigCard";
import type { OwnSeatView } from "../../../shared/OwnSeatView";
import { cardNameCombosShownOf } from "./cardNameCombosShownOf";
import { Button } from "../../components/Button";
import { StatChip } from "../../components/StatChip";
import styles from "./SelectedCardPanel.module.css";

type Props = {
  readonly card: CardName;
  readonly comboMarksAgainst: OwnSeatView | undefined;
  readonly className: string | undefined;
  readonly onClose: () => void;
};

export function LookedAtCardPanel({ card, comboMarksAgainst, className, onClose }: Props) {
  const { baseCost } = cardOf(card);
  return (
    <section className={className} aria-label={`Selected card: ${card}`}>
      <BigCard
        card={cardOf(card)}
        realCost={baseCost}
        cardNameCombos={
          comboMarksAgainst === undefined
            ? undefined
            : cardNameCombosShownOf(card, comboMarksAgainst)
        }
      />
      <h3 className={styles["cost"]}>
        Base cost <StatChip stat="funds" value={baseCost} />
      </h3>
      <div className={styles["buttons"]}>
        <Button look="secondary" onClick={onClose}>
          Close
        </Button>
      </div>
    </section>
  );
}
