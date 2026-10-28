import { useState } from "react";
import type { CardName } from "../../../shared/catalogue/CardName";
import type { HandChoice } from "./HandChoice";

const NOTHING_CHOSEN: HandChoice = { mode: "choosing", selected: null };

function pressed(choice: HandChoice, card: CardName): HandChoice {
  if (choice.mode === "choosing") {
    return { mode: "choosing", selected: choice.selected === card ? null : card };
  }
  const isMarked = choice.marked.includes(card);
  return {
    mode: "selling",
    marked: isMarked ? choice.marked.filter((marked) => marked !== card) : [...choice.marked, card],
  };
}

function stillInHand(choice: HandChoice, hand: ReadonlyArray<CardName>): HandChoice {
  if (choice.mode === "selling") {
    return { mode: "selling", marked: choice.marked.filter((card) => hand.includes(card)) };
  }
  const isSelectedInHand = choice.selected !== null && hand.includes(choice.selected);
  return isSelectedInHand ? choice : NOTHING_CHOSEN;
}

export function useHandChoice(hand: ReadonlyArray<CardName>) {
  const [choice, setChoice] = useState<HandChoice>(NOTHING_CHOSEN);
  return {
    choice: stillInHand(choice, hand),
    pressCard: (card: CardName) => {
      setChoice((current) => pressed(stillInHand(current, hand), card));
    },
    startSelling: () => {
      setChoice({ mode: "selling", marked: [] });
    },
    clear: () => {
      setChoice(NOTHING_CHOSEN);
    },
  };
}
