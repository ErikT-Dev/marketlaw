import { tradeOf } from "../../../shared/ruleFiles/tradeOf";
import type { TradeName } from "../../../shared/TradeName";
import { amountsText } from "./amountsText";
import { tradeCostsShown } from "./tradeCostsShown";

export function tradeLabel(tradeName: TradeName, buildPassPrice: number): string {
  const trade = tradeOf(tradeName);
  const gained = [
    ...(Object.keys(trade.gains).length > 0 ? [amountsText(trade.gains)] : []),
    ...(trade.buildPasses > 0
      ? [`${String(trade.buildPasses)} ${trade.buildPasses === 1 ? "build pass" : "build passes"}`]
      : []),
  ];
  return `${amountsText(tradeCostsShown(trade, buildPassPrice))} → ${gained.join(" + ")}`;
}
