import type { SeatNumber } from "../shared/SeatNumber";
import { TradeName } from "../shared/TradeName";
import type { TradeStatus } from "../shared/TradeStatus";
import type { GameState } from "./GameState";
import { rejectionOf } from "./rejectionOf";

export function tradeStatusesOf(state: GameState, seat: SeatNumber): ReadonlyArray<TradeStatus> {
  return TradeName.options.map((trade) => ({
    trade,
    rejection: rejectionOf(state, { type: "influence", seat, trade }) ?? null,
  }));
}
