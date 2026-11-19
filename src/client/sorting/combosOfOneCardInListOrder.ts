import type { Combo } from "../../shared/catalogue/Combo";
import { compareCombosOfOneCard } from "./compareCombosOfOneCard";

type PrintedCombo = {
  readonly combo: Combo;
  readonly printedIndex: number;
};

export function combosOfOneCardInListOrder(
  combos: ReadonlyArray<Combo>,
): ReadonlyArray<PrintedCombo> {
  return combos
    .map((combo, printedIndex) => ({ combo, printedIndex }))
    .sort(
      (first, second) =>
        compareCombosOfOneCard(first.combo, second.combo) ||
        first.printedIndex - second.printedIndex,
    );
}
