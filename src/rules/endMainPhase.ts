import type { DrawLogEntry } from "../shared/DrawLogEntry";
import type { MarketplaceSlot } from "../shared/MarketplaceSlot";
import type { ProjectName } from "../shared/ProjectName";
import { endMarketPhase } from "./endMarketPhase";
import { endOfTurnSteps } from "./endOfTurnSteps";
import { endTurnForQuests } from "./endTurnForQuests";
import { fillMarketplace } from "./fillMarketplace";
import { FIRST_COMPLETION_FUNDS } from "./FIRST_COMPLETION_FUNDS";
import { firstCompletionsOf } from "./firstCompletionsOf";
import { firstPlayerOf } from "./firstPlayerOf";
import type { GameState } from "./GameState";
import { MARKET_PHASES_SHOWN } from "./MARKET_PHASES_SHOWN";
import { marketGoOf } from "./marketGoOf";
import type { Random } from "./Random";
import { refillQuests } from "./refillQuests";
import type { SeatState } from "./SeatState";
import { withMainPhaseStart } from "./withMainPhaseStart";

function isShownLongEnough(slot: MarketplaceSlot): boolean {
  return slot.card !== null && slot.phasesShown >= MARKET_PHASES_SHOWN;
}

function seatAtTurnStart(seat: SeatState, firsts: ReadonlyArray<ProjectName>): SeatState {
  const afterSteps = endOfTurnSteps(seat);
  const firstFunds = seat.hasLeft
    ? 0
    : seat.projectsThisTurn.filter((project) => firsts.includes(project)).length *
      FIRST_COMPLETION_FUNDS;
  const started = {
    ...afterSteps,
    stats: { ...afterSteps.stats, funds: afterSteps.stats.funds + firstFunds },
    drawnThisPhase: [],
    newCards: [],
    hasHadMarketGo: false,
    projectsThisTurn: [],
    undoPoints: [],
    isUndoBlocked: false,
  };
  return seat.hasLeft ? started : { ...started, isDone: false, actionsThisTurn: 0 };
}

export function endMainPhase(state: GameState, random: Random): GameState {
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
  const questTable = refillQuests(endTurnForQuests(state), turn, random);
  const firsts = firstCompletionsOf(state);
  const seats = state.seats.map((seat) => seatAtTurnStart(seat, firsts));
  const started = withMainPhaseStart({
    ...state,
    turn,
    phase: "market",
    firstPlayer: firstPlayerOf(turn, seats),
    seats,
    deck: refilled.piles.deck,
    discard: refilled.piles.discard,
    holdingPile: [],
    marketplace: refilled.marketplace,
    quests: questTable.quests,
    questList: questTable.questList,
    doneOrder: [],
    firstCompletions: [...state.firstCompletions, ...firsts],
    drawLog: [...state.drawLog, ...refillShuffles],
  });
  return marketGoOf(started) === null ? endMarketPhase(started) : started;
}
