import type { StatAmounts } from "../../../shared/StatAmounts";
import { counted } from "./counted";

export function amountsText(amounts: StatAmounts): string {
  return Object.entries(amounts)
    .map(([stat, amount]) =>
      stat === "funds" ? counted(amount, "fund") : `${String(amount)} ${stat}`,
    )
    .join(" + ");
}
