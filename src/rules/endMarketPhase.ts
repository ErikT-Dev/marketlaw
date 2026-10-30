import type { GameState } from "./GameState";
import { withMainPhaseStart } from "./withMainPhaseStart";

export function endMarketPhase(state: GameState, at: number): GameState {
  return withMainPhaseStart({
    ...state,
    phase: "main",
    clockStartedAt: at,
    seats: state.seats.map((seat) => ({ ...seat, drawnThisPhase: [] })),
    marketplace: state.marketplace.map((slot) =>
      slot.card === null ? slot : { ...slot, phasesShown: slot.phasesShown + 1 },
    ),
  });
}
