import { cardOf } from "../shared/catalogue/cardOf";
import type { ComboGains } from "../shared/records/ComboGains";
import type { SeatState } from "./SeatState";

const NO_COMBO_GAINS: ComboGains = { workforce: 0, quality: 0, satisfaction: 0 };

export function comboGainsOf(seat: SeatState): ComboGains {
  return seat.combosClaimed.reduce((gains, { card, combo, times }) => {
    const gained = cardOf(card).combos[combo]?.gains;
    return gained === undefined
      ? gains
      : { ...gains, [gained.stat]: gains[gained.stat] + gained.amount * times };
  }, NO_COMBO_GAINS);
}
