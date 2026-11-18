import type { ComboStatus } from "../../../shared/ComboStatus";
import { combosInListOrder } from "../../sorting/combosInListOrder";
import { isInfiniteCombo } from "./isInfiniteCombo";

function staysInList(status: ComboStatus): boolean {
  return status.readyTimes > 0 || status.claimedTimes === 0 || isInfiniteCombo(status);
}

export function combosListOf(combos: ReadonlyArray<ComboStatus>): ReadonlyArray<ComboStatus> {
  return combosInListOrder(combos.filter(staysInList), ({ readyTimes }) => readyTimes > 0);
}
