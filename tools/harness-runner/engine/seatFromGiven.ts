import { newSeat } from "../../../src/rules/newSeat.ts";
import type { SeatState } from "../../../src/rules/SeatState.ts";
import type { SeatNumber } from "../../../src/shared/SeatNumber.ts";
import type { Given } from "./Given.ts";

type GivenSeat = NonNullable<Given["seats"]>[number];

export function seatFromGiven(seat: SeatNumber, given: GivenSeat | undefined): SeatState {
  const start = newSeat(seat);
  if (given === undefined) {
    return start;
  }
  return {
    seat,
    stats: given.stats ?? start.stats,
    hand: given.hand ?? start.hand,
    city: given.city ?? start.city,
    gainedTypes: given.gained_types ?? start.gainedTypes,
    drawnThisPhase: start.drawnThisPhase,
    buildPasses: given.build_passes ?? start.buildPasses,
    buildPassesBought: given.build_passes_bought ?? start.buildPassesBought,
    hasPlayedThisTurn: given.played_this_turn ?? start.hasPlayedThisTurn,
    hasSkippedBuild: given.skipped_build ?? start.hasSkippedBuild,
    actionsThisTurn: given.actions_this_turn ?? start.actionsThisTurn,
    isDone: given.done ?? start.isDone,
    hasLeft: given.left ?? start.hasLeft,
    timeBankMs: given.time_bank_ms ?? start.timeBankMs,
  };
}
