import type { SeatState } from "../../../src/rules/SeatState.ts";
import { typeCountsOf } from "../../../src/rules/typeCountsOf.ts";
import { comboLabel } from "./comboLabel.ts";

export function seatThen(seat: SeatState): Readonly<Record<string, unknown>> {
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
    left: seat.hasLeft,
    time_bank_ms: seat.timeBankMs,
    market: seat.hasHadMarketGo ? "out" : "in",
    new_cards: seat.newCards,
  };
}
