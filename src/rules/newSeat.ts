import type { SeatNumber } from "../shared/SeatNumber";
import type { SeatState } from "./SeatState";
import { STARTING_STATS } from "./STARTING_STATS";
import { STARTING_WORTH_GAINED } from "./STARTING_WORTH_GAINED";
import { TIME_BANK_MS } from "./TIME_BANK_MS";

export function newSeat(seat: SeatNumber): SeatState {
  return {
    seat,
    stats: STARTING_STATS,
    hand: [],
    city: [],
    drawnThisPhase: [],
    newCards: [],
    knownInHand: [],
    hasHadMarketGo: false,
    mainPhaseStartedAt: null,
    gainedTypes: {},
    combosClaimed: [],
    projects: [],
    questsCompleted: [],
    buildPasses: 0,
    buildPassesBought: 0,
    hasPlayedThisTurn: false,
    influenceUses: {},
    actionsThisTurn: 0,
    isDone: false,
    isOutOfTime: false,
    isTurnDrawOpen: false,
    logEntriesThisMainPhase: [],
    departure: null,
    timeBankMs: TIME_BANK_MS,
    timeoutsInARow: 0,
    undoPoints: [],
    isUndoBlocked: false,
    redrawsUsed: 0,
    worthGained: STARTING_WORTH_GAINED,
  };
}
