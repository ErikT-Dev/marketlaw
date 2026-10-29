import type { CardName } from "../../../shared/catalogue/CardName";
import { cardOf } from "../../../shared/catalogue/cardOf";
import type { HandCardDetails } from "../../../shared/HandCardDetails";
import { HandCard } from "../../components/HandCard";
import type { HandCardState } from "../../components/HandCardState";
import { Panel } from "../../components/Panel";
import type { HandChoice } from "./HandChoice";
import styles from "./HandPanel.module.css";

type Props = {
  readonly handDetails: ReadonlyArray<HandCardDetails>;
  readonly newCards: ReadonlyArray<CardName>;
  readonly choice: HandChoice;
  readonly pendingCards: ReadonlyArray<CardName>;
  readonly onPressCard: (card: CardName) => void;
};

function stateOf(choice: HandChoice, card: CardName, isNew: boolean): HandCardState {
  const unmarked = isNew ? "new" : "default";
  if (choice.mode === "selling") {
    return choice.marked.includes(card) ? "markedToSell" : unmarked;
  }
  return choice.selected === card ? "selected" : unmarked;
}

export function HandPanel({ handDetails, newCards, choice, pendingCards, onPressCard }: Props) {
  return (
    <Panel title={`Your hand · ${String(handDetails.length)} cards`}>
      <ul className={styles["hand"]} aria-label="Your hand">
        {handDetails.map((details) => (
          <li key={details.card}>
            <HandCard
              card={cardOf(details.card)}
              realCost={details.realCost}
              isPlayable={details.playRejection === null}
              state={stateOf(choice, details.card, newCards.includes(details.card))}
              isPending={pendingCards.includes(details.card)}
              onSelect={() => {
                onPressCard(details.card);
              }}
            />
          </li>
        ))}
      </ul>
    </Panel>
  );
}
