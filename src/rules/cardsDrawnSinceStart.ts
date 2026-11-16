import type { CardName } from "../shared/catalogue/CardName";
import type { SeatNumber } from "../shared/SeatNumber";
import type { GameState } from "./GameState";
import type { SeatPilesAtStart } from "./SeatPilesAtStart";
import { seatOf } from "./seatOf";

export function cardsDrawnSinceStart(
  state: GameState,
  viewer: SeatNumber,
  start: SeatPilesAtStart,
): ReadonlyArray<CardName> {
  const onMarketGos = state.mainPhaseStart.marketGos
    .filter((go) => go.fromLogLength >= start.drawLogLength)
    .flatMap((go) => go.drawn);
  return [...(seatOf(state, viewer)?.drawnThisPhase ?? []), ...onMarketGos];
}
