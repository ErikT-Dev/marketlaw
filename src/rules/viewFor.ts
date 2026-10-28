import type { OtherSeatView } from "../shared/OtherSeatView";
import type { OwnSeatView } from "../shared/OwnSeatView";
import type { PlayerView } from "../shared/PlayerView";
import type { SeatNumber } from "../shared/SeatNumber";
import type { GameState } from "./GameState";
import { playerOrderOf } from "./playerOrderOf";
import type { SeatState } from "./SeatState";

function ownSeatView(seat: SeatState): OwnSeatView {
  return {
    kind: "own",
    seat: seat.seat,
    stats: seat.stats,
    hand: seat.hand,
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

function otherSeatView(seat: SeatState): OtherSeatView {
  return {
    kind: "other",
    seat: seat.seat,
    stats: seat.stats,
    handCount: seat.hand.length,
    city: seat.city,
    buildPasses: seat.buildPasses,
    isDone: seat.isDone,
    hasLeft: seat.hasLeft,
    timeBankMs: seat.timeBankMs,
  };
}

export function viewFor(state: GameState, viewer: SeatNumber): PlayerView {
  return {
    seat: viewer,
    turn: state.turn,
    phase: state.phase,
    seats: state.seats.map((seat) =>
      seat.seat === viewer ? ownSeatView(seat) : otherSeatView(seat),
    ),
    deckCount: state.deck.length,
    discard: state.discard,
    marketplace: state.marketplace,
    quests: state.quests,
    bonusTypes: state.bonusTypes,
    doneOrder: state.doneOrder,
    playerOrder: playerOrderOf(state),
  };
}
