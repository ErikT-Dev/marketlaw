import { cardOf } from "../shared/catalogue/cardOf";
import type { HandCardDetails } from "../shared/HandCardDetails";
import type { GameState } from "./GameState";
import { realCostOf } from "./realCostOf";
import { rejectionOf } from "./rejectionOf";
import { sameSectorAndTierInCityOf } from "./sameSectorAndTierInCityOf";
import type { SeatState } from "./SeatState";

export function handDetailsOf(state: GameState, seat: SeatState): ReadonlyArray<HandCardDetails> {
  return seat.hand.map((name) => {
    const card = cardOf(name);
    return {
      card: name,
      realCost: realCostOf(card, seat),
      sameSectorAndTierInCity: sameSectorAndTierInCityOf(card, seat),
      playRejection: rejectionOf(state, { type: "play_card", seat: seat.seat, card: name }) ?? null,
    };
  });
}
