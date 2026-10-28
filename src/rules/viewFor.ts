import type { OtherSeatView } from "../shared/OtherSeatView";
import type { OwnSeatView } from "../shared/OwnSeatView";
import type { PlayerView } from "../shared/PlayerView";
import type { SeatNumber } from "../shared/SeatNumber";
import type { GameState } from "./GameState";
import { handDetailsOf } from "./handDetailsOf";
import { turnRejectionOf } from "./turnRejectionOf";
import { comboStatusesOf } from "./comboStatusesOf";
import { pilesShownTo } from "./pilesShownTo";
import { projectRejectionsOf } from "./projectRejectionsOf";
import { rejectionOf } from "./rejectionOf";
import { typeCountsOf } from "./typeCountsOf";
import { playerOrderOf } from "./playerOrderOf";
import type { SeatState } from "./SeatState";

function ownSeatView(state: GameState, seat: SeatState): OwnSeatView {
  return {
    kind: "own",
    seat: seat.seat,
    stats: seat.stats,
    hand: seat.hand,
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
    actionsThisTurn: seat.actionsThisTurn,
    isDone: seat.isDone,
    hasLeft: seat.hasLeft,
    timeBankMs: seat.timeBankMs,
  };
}

function otherSeatView(state: GameState, seat: SeatState): OtherSeatView {
  const shown =
    state.phase === "main"
      ? (state.mainPhaseStart.seats.find((start) => start.seat === seat.seat) ?? seat)
      : seat;
  return {
    kind: "other",
    seat: seat.seat,
    stats: shown.stats,
    handCount: shown.hand.length,
    typeCounts: typeCountsOf(shown),
    combosClaimed: shown.combosClaimed,
    projects: shown.projects,
    city: shown.city,
    buildPasses: shown.buildPasses,
    isDone: seat.isDone,
    hasLeft: seat.hasLeft,
    timeBankMs: seat.timeBankMs,
  };
}

export function viewFor(state: GameState, viewer: SeatNumber): PlayerView {
  const piles = pilesShownTo(state, viewer);
  return {
    seat: viewer,
    turn: state.turn,
    phase: state.phase,
    seats: state.seats.map((seat) =>
      seat.seat === viewer ? ownSeatView(state, seat) : otherSeatView(state, seat),
    ),
    deckCount: piles.deckCount,
    discard: piles.discard,
    marketplace: state.marketplace,
    quests: state.quests,
    bonusTypes: state.bonusTypes,
    doneOrder: state.doneOrder,
    playerOrder: playerOrderOf(state),
    drawLog: piles.drawLog,
    firstCompletions: state.firstCompletions,
  };
}
