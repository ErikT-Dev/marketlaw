import { endOfTurnSteps } from "./endOfTurnSteps";
import { fillMarketplace } from "./fillMarketplace";
import type { GameState } from "./GameState";
import type { Random } from "./Random";

export function endMainPhase(state: GameState, random: Random): GameState {
  const turn = state.turn + 1;
  const piles = { deck: state.deck, discard: [...state.discard, ...state.holdingPile] };
  const refilled = fillMarketplace(state.marketplace, piles, turn, random);
  return {
    ...state,
    turn,
    seats: state.seats.map((seat) => {
      const afterSteps = endOfTurnSteps(seat);
      return seat.hasLeft ? afterSteps : { ...afterSteps, isDone: false, actionsThisTurn: 0 };
    }),
    deck: refilled.piles.deck,
    discard: refilled.piles.discard,
    holdingPile: [],
    marketplace: refilled.marketplace,
    doneOrder: [],
  };
}
