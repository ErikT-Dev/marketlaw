import type { ClaimedCombo } from "../shared/ClaimedCombo";
import { readyCombosOf } from "./readyCombosOf";
import type { SeatState } from "./SeatState";

function withClaim(claimed: ReadonlyArray<ClaimedCombo>, ready: ClaimedCombo) {
  const known = claimed.find(({ card, combo }) => card === ready.card && combo === ready.combo);
  return known === undefined
    ? [...claimed, ready]
    : claimed.map((entry) =>
        entry === known ? { ...entry, times: entry.times + ready.times } : entry,
      );
}

export function claimAll(seat: SeatState): SeatState {
  const ready = readyCombosOf(seat);
  const stats = ready.reduce(
    (current, { gains, times }) => ({
      ...current,
      [gains.stat]: current[gains.stat] + gains.amount * times,
    }),
    seat.stats,
  );
  return {
    ...seat,
    stats,
    combosClaimed: ready.reduce<ReadonlyArray<ClaimedCombo>>(
      (claimed, { card, combo, times }) => withClaim(claimed, { card, combo, times }),
      seat.combosClaimed,
    ),
    actionsThisTurn: seat.actionsThisTurn + 1,
  };
}
