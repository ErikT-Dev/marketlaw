import type { CardName } from "../shared/catalogue/CardName";
import { cardOf } from "../shared/catalogue/cardOf";
import type { SeatState } from "./SeatState";
import { realCostOf } from "./realCostOf";
import { withoutCard } from "./withoutCard";
import { statsAfterPlaying } from "./statsAfterPlaying";

export function playCard(seat: SeatState, name: CardName): SeatState {
  const card = cardOf(name);
  return {
    ...seat,
    stats: statsAfterPlaying(seat.stats, card, realCostOf(card, seat)),
    hand: withoutCard(seat.hand, name),
    newCards: seat.newCards.filter((card) => card !== name),
    knownInHand: seat.knownInHand.filter((card) => card !== name),
    city: [...seat.city, name],
    buildPasses: seat.hasPlayedThisTurn ? seat.buildPasses - 1 : seat.buildPasses,
    hasPlayedThisTurn: true,
    actionsThisTurn: seat.actionsThisTurn + 1,
  };
}
