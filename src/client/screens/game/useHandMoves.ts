import type { CardName } from "../../../shared/catalogue/CardName";
import type { ActionIntent } from "../../../shared/protocol/ActionIntent";
import { useHandChoice } from "./useHandChoice";

export function useHandMoves(
  hand: ReadonlyArray<CardName>,
  onAction: (action: ActionIntent) => void,
) {
  const { choice, pressCard, startSelling, clear } = useHandChoice(hand);
  const selected = choice.mode === "choosing" ? choice.selected : null;
  function playSelected() {
    if (selected !== null) {
      onAction({ type: "play_card", card: selected });
    }
    clear();
  }
  function sell() {
    if (choice.mode === "choosing") {
      startSelling();
      return;
    }
    const [first, ...rest] = choice.marked;
    if (first !== undefined) {
      onAction({ type: "sell", cards: [first, ...rest] });
    }
    clear();
  }
  return { choice, selected, pressCard, clear, playSelected, sell };
}
