import type { CardName } from "../shared/catalogue/CardName";
import type { DrawLogEntry } from "../shared/DrawLogEntry";
import { drawCard } from "./drawCard";
import type { DrawForSeat } from "./DrawForSeat";
import type { GameState } from "./GameState";
import type { Random } from "./Random";
import { updateSeat } from "./updateSeat";

type CardsIntoHand = {
  readonly state: GameState;
  readonly cards: ReadonlyArray<CardName>;
};

export function cardsIntoHand(
  state: GameState,
  draw: Omit<DrawForSeat, "cause">,
  random: Random,
): CardsIntoHand {
  const { seat, target, tier } = draw;
  const drawn = drawCard({ deck: state.deck, discard: state.discard }, target, tier, random, "top_card");
  const withCards = updateSeat(state, seat, (current) => ({
    ...current,
    hand: [...current.hand, ...drawn.cards],
    drawnThisPhase: [...current.drawnThisPhase, ...drawn.cards],
    newCards: [...current.newCards, ...drawn.cards],
  }));
  const shuffles = drawn.shuffles.map(
    (shuffle): DrawLogEntry => ({ kind: "shuffle", turn: state.turn, seat, ...shuffle }),
  );
  return {
    state: {
      ...withCards,
      deck: drawn.piles.deck,
      discard: drawn.piles.discard,
      drawLog: [...withCards.drawLog, ...shuffles],
    },
    cards: drawn.cards,
  };
}
