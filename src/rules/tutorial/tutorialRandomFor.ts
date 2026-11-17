import type { Card } from "../../shared/catalogue/Card";
import type { CardName } from "../../shared/catalogue/CardName";
import { cardOf } from "../../shared/catalogue/cardOf";
import type { Random } from "../Random";

function noPickInTutorial(): never {
  throw new Error("the tutorial picks no quests or types after its setup");
}

export function tutorialRandomFor(draws: ReadonlyArray<CardName>): Random {
  let drawnSoFar = 0;
  function nextDrawnCard(): Card {
    const name = draws[drawnSoFar];
    if (name === undefined) {
      throw new Error(`the tutorial step draws only ${String(draws.length)} cards`);
    }
    return cardOf(name);
  }
  return {
    pickSector: () => nextDrawnCard().sector,
    pickTier: () => {
      const { tier } = nextDrawnCard();
      drawnSoFar += 1;
      return tier;
    },
    pickQuest: noPickInTutorial,
    pickType: noPickInTutorial,
    shuffle: (cards) => cards,
  };
}
