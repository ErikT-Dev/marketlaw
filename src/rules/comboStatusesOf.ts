import { cardOf } from "../shared/catalogue/cardOf";
import type { ComboStatus } from "../shared/ComboStatus";
import { readyCombosOf } from "./readyCombosOf";
import type { SeatState } from "./SeatState";

export function comboStatusesOf(seat: SeatState): ReadonlyArray<ComboStatus> {
  const ready = readyCombosOf(seat);
  return seat.city.flatMap((card) =>
    cardOf(card).combos.map((unused, combo) => ({
      card,
      combo,
      claimedTimes:
        seat.combosClaimed.find((claimed) => claimed.card === card && claimed.combo === combo)
          ?.times ?? 0,
      readyTimes:
        ready.find((entry) => entry.card === card && entry.combo === combo)?.times ?? 0,
    })),
  );
}
