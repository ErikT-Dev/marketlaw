import type { DrawLogEntry } from "../shared/DrawLogEntry";
import type { MarketplaceSlot } from "../shared/MarketplaceSlot";
import { endMarketPhase } from "./endMarketPhase";
import { endOfTurnSteps } from "./endOfTurnSteps";
import { endTurnForQuests } from "./endTurnForQuests";
import { fillMarketplace } from "./fillMarketplace";
import { firstPlayerOf } from "./firstPlayerOf";
import type { GameState } from "./GameState";
import { MARKET_PHASES_SHOWN } from "../shared/MARKET_PHASES_SHOWN";
import { incomeGainEntriesOf } from "./incomeGainEntriesOf";
import { marketGoOf } from "./marketGoOf";
import type { Random } from "./Random";
import type { SeatState } from "./SeatState";
import { withMainPhaseStart } from "./withMainPhaseStart";
import { withSupport } from "./withSupport";
import { withTurnBuildPass } from "./withTurnBuildPass";

function isShownLongEnough(slot: MarketplaceSlot): boolean {
  return slot.card !== null && slot.phasesShown >= MARKET_PHASES_SHOWN;
}

function seatAtTurnStart(seat: SeatState): SeatState {
  const afterSteps = withTurnBuildPass(endOfTurnSteps(seat));
  const started = {
    ...afterSteps,
    drawnThisPhase: [],
    newCards: [],
    hasHadMarketGo: false,
    mainPhaseStartedAt: null,
    isOutOfTime: false,
    isTurnDrawOpen: false,
    projectsThisTurn: [],
    undoPoints: [],
    isUndoBlocked: false,
  };
  return seat.departure !== null ? started : { ...started, isDone: false, actionsThisTurn: 0 };
}

export function endMainPhase(state: GameState, random: Random, at: number): GameState {
  const turn = state.turn + 1;
  const removed = state.marketplace.flatMap((slot) =>
    isShownLongEnough(slot) && slot.card !== null ? [slot.card] : [],
  );
  const kept = state.marketplace.map((slot) =>
    isShownLongEnough(slot) ? { ...slot, card: null, phasesShown: 0 } : slot,
  );
  const piles = { deck: state.deck, discard: [...state.discard, ...state.holdingPile, ...removed] };
  const refilled = fillMarketplace(kept, piles, turn, random);
  const refillShuffles = refilled.shuffles.map(
    (shuffle): DrawLogEntry => ({ kind: "shuffle", turn, seat: null, ...shuffle }),
  );
  const questTable = endTurnForQuests(state, turn, random);
  const startedSeats = state.seats.map(seatAtTurnStart);
  const firstPlayer = firstPlayerOf(turn, startedSeats);
  const supported = withSupport({
    seats: startedSeats,
    turn,
    firstPlayer,
    mainPhaseLog: [...state.mainPhaseLog, ...incomeGainEntriesOf(state, { turn, firstPlayer })],
  });
  const started = withMainPhaseStart({
    ...state,
    ...supported,
    phase: "market",
    deck: refilled.piles.deck,
    discard: refilled.piles.discard,
    holdingPile: [],
    marketplace: refilled.marketplace,
    quests: questTable.quests,
    questList: questTable.questList,
    doneOrder: [],
    drawLog: [...state.drawLog, ...refillShuffles],
    clockStartedAt: at,
  });
  return marketGoOf(started) === null ? endMarketPhase(started, at) : started;
}
