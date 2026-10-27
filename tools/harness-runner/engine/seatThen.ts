import type { SeatState } from "../../../src/rules/SeatState.ts";
import { typeCountsOf } from "../../../src/rules/typeCountsOf.ts";

export function seatThen(seat: SeatState): Readonly<Record<string, unknown>> {
  return {
    seat: seat.seat,
    stats: seat.stats,
    hand: seat.hand,
    city: seat.city,
    gained_types: seat.gainedTypes,
    type_counts: typeCountsOf(seat),
    build_passes: seat.buildPasses,
    build_passes_bought: seat.buildPassesBought,
    played_this_turn: seat.hasPlayedThisTurn,
    skipped_build: seat.hasSkippedBuild,
    actions_this_turn: seat.actionsThisTurn,
    done: seat.isDone,
    left: seat.hasLeft,
    time_bank_ms: seat.timeBankMs,
  };
}
