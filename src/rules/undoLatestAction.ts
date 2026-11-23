import type { CardName } from "../shared/catalogue/CardName";
import type { SeatNumber } from "../shared/SeatNumber";
import type { GameState } from "./GameState";
import { seatOf } from "./seatOf";
import { undoLatest } from "./undoLatest";
import { updateSeat } from "./updateSeat";

function withoutLastCopy(cards: ReadonlyArray<CardName>, card: CardName): ReadonlyArray<CardName> {
  const index = cards.lastIndexOf(card);
  return index === -1 ? cards : [...cards.slice(0, index), ...cards.slice(index + 1)];
}

function cardsMissingFrom(
  cards: ReadonlyArray<CardName>,
  present: ReadonlyArray<CardName>,
): ReadonlyArray<CardName> {
  return present.reduce(withoutLastCopy, cards);
}

export function undoLatestAction(state: GameState, seat: SeatNumber): GameState {
  const current = seatOf(state, seat);
  if (current === undefined) {
    return state;
  }
  const restored = undoLatest(current);
  const leftTheHand = cardsMissingFrom(restored.hand, current.hand);
  const played = cardsMissingFrom(current.city, restored.city);
  const sold = cardsMissingFrom(leftTheHand, played);
  const undone = updateSeat(state, seat, () => restored);
  return { ...undone, holdingPile: sold.reduce(withoutLastCopy, undone.holdingPile) };
}
