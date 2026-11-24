import { fundsInTenths } from "./fundsInTenths";
import type { StatAmounts } from "./StatAmounts";

export function amountsInTenths(amounts: StatAmounts): StatAmounts {
  return amounts.funds === undefined
    ? amounts
    : { ...amounts, funds: fundsInTenths(amounts.funds) };
}
