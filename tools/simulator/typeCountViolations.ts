import type { GameState } from "../../src/rules/GameState.ts";
import { cardOf } from "../../src/shared/catalogue/cardOf.ts";
import type { PlayerView } from "../../src/shared/PlayerView.ts";
import type { SeatNumber } from "../../src/shared/SeatNumber.ts";
import { startOf } from "./startOf.ts";

function countsText(counts: Readonly<Record<string, number | undefined>>): string {
  return JSON.stringify(
    Object.entries(counts)
      .filter(([, count]) => (count ?? 0) !== 0)
      .sort(([a], [b]) => a.localeCompare(b)),
  );
}

export function typeCountViolations(
  state: GameState,
  viewer: SeatNumber,
  view: PlayerView,
): ReadonlyArray<string> {
  return view.seats.flatMap((seen) => {
    const live = state.seats.find((seat) => seat.seat === seen.seat);
    const source = seen.kind === "own" ? live : (startOf(state, seen.seat) ?? live);
    const expected: Record<string, number> = { ...source?.gainedTypes };
    for (const { type, count } of seen.city.flatMap((card) => cardOf(card).types)) {
      expected[type] = (expected[type] ?? 0) + count;
    }
    return countsText(seen.typeCounts) === countsText(expected)
      ? []
      : [
          `I13: seat ${String(viewer)} is shown type counts for seat ${String(seen.seat)} that do not match its cards`,
        ];
  });
}
