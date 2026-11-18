import type { TradeName } from "../../../shared/TradeName";
import { TRADES } from "../../../shared/TRADES";
import { amountsText } from "./amountsText";

export function tradeLabel(trade: TradeName, buildPassPrice: number): string {
  const { costs, gains, doesGiveBuildPass } = TRADES[trade];
  const paid = amountsText(trade === "buy_build_pass" ? { funds: buildPassPrice } : costs);
  return `${paid} → ${doesGiveBuildPass ? "1 build pass" : amountsText(gains)}`;
}
