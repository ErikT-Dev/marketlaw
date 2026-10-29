import type { SeatNumber } from "../shared/SeatNumber";
import type { SeatState } from "./SeatState";
import { STARTING_STATS } from "./STARTING_STATS";
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
    gainedTypes: {},
    combosClaimed: [],
    projects: [],
    projectsThisTurn: [],
    buildPasses: 0,
    buildPassesBought: 0,
    hasPlayedThisTurn: false,
    hasSkippedBuild: false,
    influenceUses: {},
    actionsThisTurn: 0,
    isDone: false,
    hasLeft: false,
    timeBankMs: TIME_BANK_MS,
    undoPoints: [],
    isUndoBlocked: false,
  };
}
