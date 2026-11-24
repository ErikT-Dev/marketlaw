import type { CardName } from "../../../shared/catalogue/CardName";
import type { HandCardDetails } from "../../../shared/HandCardDetails";
import type { HandCardState } from "../../components/HandCardState";
import { Panel } from "../../components/Panel";
import { handInListOrder } from "../../sorting/handInListOrder";
import type { HandChoice } from "./HandChoice";
import styles from "./HandPanel.module.css";
import { Highlighted } from "./Highlighted";
import { HandPanelCard } from "./HandPanelCard";

type Props = {
  readonly handDetails: ReadonlyArray<HandCardDetails>;
  readonly newCards: ReadonlyArray<CardName>;
  readonly choice: HandChoice;
  readonly pendingCards: ReadonlyArray<CardName>;
  readonly onPressCard: (card: CardName) => void;
};

function stateOf(choice: HandChoice, card: CardName): HandCardState {
  if (choice.mode === "selling") {
    return choice.marked.includes(card) ? "markedToSell" : "default";
  }
  return choice.selected === card ? "selected" : "default";
}

export function HandPanel({ handDetails, newCards, choice, pendingCards, onPressCard }: Props) {
  return (
    <Highlighted part={{ kind: "panel", panel: "hand" }} isBlock>
      <Panel title={`Your hand · ${String(handDetails.length)} cards`}>
        <ul className={styles["hand"]} aria-label="Your hand">
          {handInListOrder(handDetails).map((details) => (
            <li key={details.card}>
              <Highlighted part={{ kind: "hand_card", card: details.card }} isBlock>
                <HandPanelCard
                  card={details.card}
                  realCost={details.realCost}
                  isPlayable={details.playRejection === null}
                  state={stateOf(choice, details.card)}
                  isNew={newCards.includes(details.card)}
                  isPending={pendingCards.includes(details.card)}
                  onPressCard={onPressCard}
                />
              </Highlighted>
            </li>
          ))}
        </ul>
      </Panel>
    </Highlighted>
  );
}
