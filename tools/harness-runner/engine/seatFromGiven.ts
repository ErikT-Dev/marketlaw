import { newSeat } from "../../../src/rules/newSeat.ts";
import { withTurnBuildPass } from "../../../src/rules/withTurnBuildPass.ts";
import { cardOf } from "../../../src/shared/catalogue/cardOf.ts";
import type { CardName } from "../../../src/shared/catalogue/CardName.ts";
import type { SeatState } from "../../../src/rules/SeatState.ts";
import type { SeatNumber } from "../../../src/shared/SeatNumber.ts";
import { comboLabel } from "./comboLabel.ts";
import type { Given } from "./Given.ts";

type GivenSeat = NonNullable<Given["seats"]>[number];

function comboIndexOf(card: CardName, label: string): number {
  const index = cardOf(card).combos.findIndex(
    (combo, position) => comboLabel(card, position) === label,
  );
  if (index < 0) {
    throw new Error(`${card} has no combo "${label}"`);
  }
  return index;
}

function progressFromGiven(given: GivenSeat) {
  return {
    combosClaimed: (given.combos_claimed ?? []).map(({ card, combo, times }) => ({
      card,
      combo: comboIndexOf(card, combo),
      times,
    })),
    projects: given.projects ?? [],
    projectsThisTurn: [],
    questsCompleted: given.quests_completed ?? [],
  };
}

function buildFromGiven(given: GivenSeat, start: SeatState) {
  return {
    buildPasses: given.build_passes ?? start.buildPasses,
    buildPassesBought: given.build_passes_bought ?? start.buildPassesBought,
    hasPlayedThisTurn: given.played_this_turn ?? start.hasPlayedThisTurn,
    influenceUses: given.influence_uses ?? start.influenceUses,
  };
}

function turnStatusFromGiven(given: GivenSeat, start: SeatState) {
  return {
    actionsThisTurn: given.actions_this_turn ?? start.actionsThisTurn,
    timeoutsInARow: given.timeouts_in_a_row ?? start.timeoutsInARow,
    isDone: given.done ?? start.isDone,
    isOutOfTime: given.out_of_time ?? start.isOutOfTime,
    isTurnDrawOpen: given.turn_draw_pending ?? start.isTurnDrawOpen,
    redrawsUsed: given.redraws_used ?? start.redrawsUsed,
    logEntriesThisMainPhase: start.logEntriesThisMainPhase,
  };
}

export function seatFromGiven(
  seat: SeatNumber,
  given: GivenSeat | undefined,
  turn: number,
): SeatState {
  const start = withTurnBuildPass(newSeat(seat));
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
    newCards: given.new_cards ?? start.newCards,
    knownInHand: start.knownInHand,
    hasHadMarketGo: given.market === "out",
    mainPhaseStartedAt: start.mainPhaseStartedAt,
    ...progressFromGiven(given),
    ...buildFromGiven(given, start),
    ...turnStatusFromGiven(given, start),
    departure: given.left === true ? { turn, cardsInHand: (given.hand ?? []).length } : null,
    timeBankMs: given.time_bank_ms ?? start.timeBankMs,
    undoPoints: start.undoPoints,
    isUndoBlocked: start.isUndoBlocked,
  };
}
