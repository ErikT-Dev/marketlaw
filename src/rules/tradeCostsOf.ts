import type { StatAmounts } from "../shared/StatAmounts";
import type { TradeName } from "../shared/TradeName";
import { TRADES } from "../shared/TRADES";
import type { SeatState } from "./SeatState";

export function tradeCostsOf(seat: SeatState, trade: TradeName): StatAmounts {
  const costs = TRADES[trade].costs;
  return trade === "buy_build_pass"
    ? { ...costs, funds: (costs.funds ?? 0) + seat.buildPassesBought }
    : costs;
}
