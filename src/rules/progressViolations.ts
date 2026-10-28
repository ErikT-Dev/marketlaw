import { cardOf } from "../shared/catalogue/cardOf";
import type { GameState } from "./GameState";
import type { SeatState } from "./SeatState";
import { typeCountsOf } from "./typeCountsOf";

function comboViolations(seat: SeatState): ReadonlyArray<string> {
  const counts = typeCountsOf(seat);
  return seat.combosClaimed.flatMap(({ card, combo, times }) => {
    const found = cardOf(card).combos[combo];
    const allowed =
      found?.kind === "type_count" && found.isInfinite
        ? Math.floor((counts[found.type] ?? 0) / found.count)
        : 1;
    return times > allowed
      ? [`I14: seat ${String(seat.seat)} claimed ${card} combo ${String(combo + 1)} ${String(times)} times`]
      : [];
  });
}

function projectViolations(seat: SeatState): ReadonlyArray<string> {
  return seat.projects
    .filter((project, index) => seat.projects.indexOf(project) !== index)
    .map(
      (project) =>
        `I12: seat ${String(seat.seat)} completed the ${project} project more than once`,
    );
}

export function progressViolations(state: GameState): ReadonlyArray<string> {
  return state.seats.flatMap((seat) => [...projectViolations(seat), ...comboViolations(seat)]);
}
