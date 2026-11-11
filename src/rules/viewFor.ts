import type { OtherSeatView } from "../shared/OtherSeatView";
import type { OwnSeatView } from "../shared/OwnSeatView";
import type { PlayerView } from "../shared/PlayerView";
import type { SeatNumber } from "../shared/SeatNumber";
import type { GameState } from "./GameState";
import { handDetailsOf } from "./handDetailsOf";
import { turnRejectionOf } from "./turnRejectionOf";
import { comboStatusesOf } from "./comboStatusesOf";
import { decisionClockOf } from "./decisionClockOf";
import { drawActionStatusesOf } from "./drawActionStatusesOf";
import { tradeCostsOf } from "./tradeCostsOf";
import { tradeStatusesOf } from "./tradeStatusesOf";
import { phaseShownTo } from "./phaseShownTo";
import { pilesShownTo } from "./pilesShownTo";
import { projectRejectionsOf } from "./projectRejectionsOf";
import { rejectionOf } from "./rejectionOf";
import { typeCountsOf } from "./typeCountsOf";
import { marketGoOf } from "./marketGoOf";
import { playerOrderOf } from "./playerOrderOf";
import { questPlacesShownTo } from "./questPlacesShownTo";
import { seatShownTo } from "./seatShownTo";
import type { SeatState } from "./SeatState";
import { nextVoteTurnOf } from "./nextVoteTurnOf";
import { voteShownTo } from "./voteShownTo";

function ownSeatView(state: GameState, seat: SeatState): OwnSeatView {
  return {
    kind: "own",
    seat: seat.seat,
    stats: seat.stats,
    hand: seat.hand,
    newCards: seat.newCards,
    handDetails: handDetailsOf(state, seat),
    sellRejection: turnRejectionOf(state, seat.seat, "sell") ?? null,
    endTurnRejection: turnRejectionOf(state, seat.seat, "end_turn") ?? null,
    typeCounts: typeCountsOf(seat),
    combos: comboStatusesOf(seat),
    claimAllRejection: rejectionOf(state, { type: "claim_all", seat: seat.seat }) ?? null,
    projects: seat.projects,
    projectRejections: projectRejectionsOf(state, seat.seat),
    city: seat.city,
    buildPasses: seat.buildPasses,
    hasPlayedThisTurn: seat.hasPlayedThisTurn,
    hasSkippedBuild: seat.hasSkippedBuild,
    influenceUses: seat.influenceUses,
    trades: tradeStatusesOf(state, seat.seat),
    buildPassPrice: tradeCostsOf(seat, "buy_build_pass").funds ?? 0,
    drawActions: drawActionStatusesOf(state, seat),
    undoRejection: rejectionOf(state, { type: "undo", seat: seat.seat }) ?? null,
    hasHadMarketGo: seat.hasHadMarketGo,
    turnDrawRejection: turnRejectionOf(state, seat.seat, "turn_draw") ?? null,
    marketCardRejection:
      turnRejectionOf(state, seat.seat, "turn_draw") ??
      (state.marketplace.every(({ card }) => card === null) ? "marketplace_empty" : null),
    actionsThisTurn: seat.actionsThisTurn,
    isDone: seat.isDone,
    isOutOfTime: seat.isOutOfTime,
    hasLeft: seat.departure !== null,
    timeBankMs: seat.timeBankMs,
    clock: decisionClockOf(state, seat.seat),
  };
}

function otherSeatView(state: GameState, seat: SeatState, viewer: SeatNumber): OtherSeatView {
  const shown = seatShownTo(state, seat, viewer);
  return {
    kind: "other",
    seat: seat.seat,
    stats: shown.stats,
    handCount: shown.hand.length,
    knownInHand: shown.knownInHand,
    hasHadMarketGo: seat.hasHadMarketGo,
    typeCounts: typeCountsOf(shown),
    combosClaimed: shown.combosClaimed,
    projects: shown.projects,
    questsCompleted: shown.questsCompleted,
    influenceUses: shown.influenceUses,
    city: shown.city,
    buildPasses: shown.buildPasses,
    isDone: seat.isDone,
    isOutOfTime: seat.isOutOfTime,
    hasLeft: seat.departure !== null,
    timeBankMs: seat.timeBankMs,
    clock: decisionClockOf(state, seat.seat),
  };
}

export function viewFor(state: GameState, viewer: SeatNumber): PlayerView {
  const piles = pilesShownTo(state, viewer);
  return {
    seat: viewer,
    turn: state.turn,
    phase: phaseShownTo(state, viewer),
    firstPlayer: state.firstPlayer,
    marketGo: marketGoOf(state),
    seats: state.seats.map((seat) =>
      seat.seat === viewer ? ownSeatView(state, seat) : otherSeatView(state, seat, viewer),
    ),
    deckCount: piles.deckCount,
    discardCount: piles.discard.length,
    marketplace: state.marketplace,
    quests: questPlacesShownTo(state, viewer),
    bonusTypes: state.bonusTypes,
    doneOrder: state.doneOrder,
    playerOrder: playerOrderOf(state),
    drawLog: piles.drawLog,
    firstCompletions: state.firstCompletions,
    vote: voteShownTo(state, viewer),
    nextVoteTurn: nextVoteTurnOf(state),
    result: state.result,
  };
}
