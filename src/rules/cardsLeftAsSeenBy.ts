import type { CardName } from "../shared/catalogue/CardName";
import type { SeatNumber } from "../shared/SeatNumber";
import type { GameState } from "./GameState";
import { seatOf } from "./seatOf";

function withoutOne(cards: ReadonlyArray<CardName>, card: CardName): ReadonlyArray<CardName> {
  const index = cards.indexOf(card);
  return index < 0 ? cards : [...cards.slice(0, index), ...cards.slice(index + 1)];
}

export function cardsLeftAsSeenBy(state: GameState, viewer: SeatNumber): ReadonlyArray<CardName> {
  if (state.phase !== "main") {
    return [...state.deck, ...state.discard];
  }
  const start = state.mainPhaseStart;
  const drawn = seatOf(state, viewer)?.drawnThisPhase ?? [];
  return drawn.reduce(withoutOne, [...start.deck, ...start.discard]);
}
