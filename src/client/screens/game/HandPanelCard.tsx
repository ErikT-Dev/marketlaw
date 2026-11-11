import { memo } from "react";
import type { CardName } from "../../../shared/catalogue/CardName";
import { cardOf } from "../../../shared/catalogue/cardOf";
import { HandCard } from "../../components/HandCard";
import type { HandCardState } from "../../components/HandCardState";

type Props = {
  readonly card: CardName;
  readonly realCost: number;
  readonly isPlayable: boolean;
  readonly state: HandCardState;
  readonly isNew: boolean;
  readonly isPending: boolean;
  readonly onPressCard: (card: CardName) => void;
};

function HandPanelCardButton({ card, onPressCard, ...shown }: Props) {
  return (
    <HandCard
      card={cardOf(card)}
      {...shown}
      onSelect={() => {
        onPressCard(card);
      }}
    />
  );
}

export const HandPanelCard = memo(HandPanelCardButton);
