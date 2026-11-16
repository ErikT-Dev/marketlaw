import type { MarketGoDraws } from "./MarketGoDraws";
import type { SeatPilesAtStart } from "./SeatPilesAtStart";
import type { SeatState } from "./SeatState";

export type MainPhaseStart = {
  readonly seats: ReadonlyArray<SeatState>;
  readonly piles: ReadonlyArray<SeatPilesAtStart>;
  readonly marketGos: ReadonlyArray<MarketGoDraws>;
};
