import type { Combo } from "../shared/catalogue/Combo";
import { cardOf } from "../shared/catalogue/cardOf";
import type { CardName } from "../shared/catalogue/CardName";
import type { ReadyCombo } from "./ReadyCombo";
import type { SeatState } from "./SeatState";
import type { TypeCounts } from "./TypeCounts";
import { typeCountsOf } from "./typeCountsOf";

function timesAllowed(combo: Combo, seat: SeatState, counts: TypeCounts): number {
  if (combo.kind === "card_name") {
    return seat.city.includes(combo.card) ? 1 : 0;
  }
  const count = counts[combo.type] ?? 0;
  if (combo.isInfinite) {
    return Math.floor(count / combo.count);
  }
  return count >= combo.count ? 1 : 0;
}

function timesClaimed(seat: SeatState, card: CardName, combo: number): number {
  return (
    seat.combosClaimed.find((claimed) => claimed.card === card && claimed.combo === combo)
      ?.times ?? 0
  );
}

export function readyCombosOf(seat: SeatState): ReadonlyArray<ReadyCombo> {
  const counts = typeCountsOf(seat);
  return seat.city.flatMap((card) =>
    cardOf(card).combos.flatMap((combo, index) => {
      const times = timesAllowed(combo, seat, counts) - timesClaimed(seat, card, index);
      return times > 0 ? [{ card, combo: index, times, gains: combo.gains }] : [];
    }),
  );
}
