import type { GameState } from "./GameState";
import { withOwnMainPhaseStart } from "./withOwnMainPhaseStart";

export function endMarketPhase(state: GameState, at: number): GameState {
  const main: GameState = {
    ...state,
    phase: "main",
    clockStartedAt: at,
    seats: state.seats.map((seat) => (seat.hasHadMarketGo ? seat : { ...seat, drawnThisPhase: [] })),
    marketplace: state.marketplace.map((slot) =>
      slot.card === null ? slot : { ...slot, phasesShown: slot.phasesShown + 1 },
    ),
  };
  return main.seats.reduce((soFar, seat) => withOwnMainPhaseStart(soFar, seat.seat), main);
}
