import { useCallback, useState } from "react";
import type { CardName } from "../../../shared/catalogue/CardName";
import type { ActionIntent } from "../../../shared/protocol/ActionIntent";
import type { LookedAtCard } from "./LookedAtCard";
import { useHandMoves } from "./useHandMoves";

export function useHandBesideLookedAt(
  hand: ReadonlyArray<CardName>,
  onAction: (action: ActionIntent) => void,
  lookedAt: LookedAtCard | null,
  onLookAt: (lookedAt: LookedAtCard | null) => void,
) {
  const moves = useHandMoves(hand, onAction);
  const { selected, clear, pressCard } = moves;
  const [lookedAtBefore, setLookedAtBefore] = useState(lookedAt);
  if (lookedAt !== lookedAtBefore) {
    setLookedAtBefore(lookedAt);
    if (lookedAt !== null && selected !== null) {
      clear();
    }
  }
  const pressHandCard = useCallback(
    (card: CardName) => {
      onLookAt(null);
      pressCard(card);
    },
    [onLookAt, pressCard],
  );
  return { ...moves, pressCard: pressHandCard };
}
