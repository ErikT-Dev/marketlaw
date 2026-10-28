import type { StatAmounts } from "../../../shared/StatAmounts";
import type { TradeName } from "../../../shared/TradeName";
import { TRADES } from "../../../shared/TRADES";
import { counted } from "./counted";

export function amountsText(amounts: StatAmounts): string {
  return Object.entries(amounts)
    .map(([stat, amount]) =>
      stat === "funds" ? counted(amount, "fund") : `${String(amount)} ${stat}`,
    )
    .join(" + ");
}

export function tradeLabel(trade: TradeName, buildPassPrice: number): string {
  const { costs, gains, doesGiveBuildPass } = TRADES[trade];
  const paid =
    trade === "skip_build"
      ? "Skip build"
      : amountsText(trade === "buy_build_pass" ? { funds: buildPassPrice } : costs);
  return `${paid} → ${doesGiveBuildPass ? "1 build pass" : amountsText(gains)}`;
}
