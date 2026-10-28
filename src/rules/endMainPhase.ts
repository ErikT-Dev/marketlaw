import { endOfTurnSteps } from "./endOfTurnSteps";
import { fillMarketplace } from "./fillMarketplace";
import { FIRST_COMPLETION_FUNDS } from "./FIRST_COMPLETION_FUNDS";
import { firstCompletionsOf } from "./firstCompletionsOf";
import type { GameState } from "./GameState";
import type { Random } from "./Random";
import { withMainPhaseStart } from "./withMainPhaseStart";

export function endMainPhase(state: GameState, random: Random): GameState {
  const turn = state.turn + 1;
  const piles = { deck: state.deck, discard: [...state.discard, ...state.holdingPile] };
  const refilled = fillMarketplace(state.marketplace, piles, turn, random);
  const firsts = firstCompletionsOf(state);
  return withMainPhaseStart({
    ...state,
    turn,
    seats: state.seats.map((seat) => {
      const afterSteps = endOfTurnSteps(seat);
      const firstFunds =
        seat.hasLeft
          ? 0
          : seat.projectsThisTurn.filter((project) => firsts.includes(project)).length *
            FIRST_COMPLETION_FUNDS;
      const started = {
        ...afterSteps,
        stats: { ...afterSteps.stats, funds: afterSteps.stats.funds + firstFunds },
        drawnThisPhase: [],
        projectsThisTurn: [],
      };
      return seat.hasLeft ? started : { ...started, isDone: false, actionsThisTurn: 0 };
    }),
    deck: refilled.piles.deck,
    discard: refilled.piles.discard,
    holdingPile: [],
    marketplace: refilled.marketplace,
    doneOrder: [],
    firstCompletions: [...state.firstCompletions, ...firsts],
  });
}
