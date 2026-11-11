import { decisionClockOf } from "../../../src/rules/decisionClockOf.ts";
import type { GameState } from "../../../src/rules/GameState.ts";
import type { SeatState } from "../../../src/rules/SeatState.ts";
import { bankLeftAt } from "../../../src/shared/bankLeftAt.ts";
import { typeCountsOf } from "../../../src/rules/typeCountsOf.ts";
import { comboLabel } from "./comboLabel.ts";

export function seatThen(
  state: GameState,
  seat: SeatState,
  now: number,
): Readonly<Record<string, unknown>> {
  const clock = decisionClockOf(state, seat.seat);
  return {
    seat: seat.seat,
    stats: seat.stats,
    hand: seat.hand,
    city: seat.city,
    gained_types: seat.gainedTypes,
    type_counts: typeCountsOf(seat),
    combos_claimed: seat.combosClaimed.map(({ card, combo, times }) => ({
      card,
      combo: comboLabel(card, combo),
      times,
    })),
    projects: seat.projects,
    quests_completed: seat.questsCompleted,
    build_passes: seat.buildPasses,
    build_passes_bought: seat.buildPassesBought,
    played_this_turn: seat.hasPlayedThisTurn,
    skipped_build: seat.hasSkippedBuild,
    influence_uses: seat.influenceUses,
    actions_this_turn: seat.actionsThisTurn,
    done: seat.isDone,
    out_of_time: seat.isOutOfTime,
    turn_draw_pending: seat.isTurnDrawOpen,
    left: seat.departure !== null,
    time_bank_ms: clock === null ? seat.timeBankMs : bankLeftAt(clock, now),
    timeouts_in_a_row: seat.timeoutsInARow,
    market: seat.hasHadMarketGo ? "out" : "in",
    new_cards: seat.newCards,
  };
}
