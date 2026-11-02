import type { GameResult } from "../shared/GameResult";
import type { PlaceResult } from "../shared/PlaceResult";
import { bonusTypePointsOf } from "./bonusTypePointsOf";
import type { GameState } from "./GameState";
import { hasReachedEndGoal } from "./hasReachedEndGoal";
import { playerOrderOf } from "./playerOrderOf";
import { scoreOf } from "./scoreOf";

function rankOf(state: GameState, place: PlaceResult): ReadonlyArray<number> {
  const doneIndex = state.doneOrder.indexOf(place.seat);
  const orderIndex = playerOrderOf(state).indexOf(place.seat);
  return [
    place.hasLeft ? 1 : 0,
    -place.score,
    doneIndex === -1 ? state.seats.length : doneIndex,
    orderIndex === -1 ? state.seats.length : orderIndex,
    place.seat,
  ];
}

function compareRanks(first: ReadonlyArray<number>, second: ReadonlyArray<number>): number {
  const index = first.findIndex((value, at) => value !== second[at]);
  return index === -1 ? 0 : (first[index] ?? 0) - (second[index] ?? 0);
}

export function gameResultOf(state: GameState): GameResult {
  const places = state.seats.map((seat) => {
    const bonusTypePoints = bonusTypePointsOf(seat, state.bonusTypes);
    return {
      seat: seat.seat,
      score: scoreOf(seat, state.turn, bonusTypePoints),
      bonusTypePoints,
      hasLeft: seat.hasLeft,
      hasReachedEndGoal: hasReachedEndGoal(seat),
      income: seat.stats.income,
      fundsAndHand: seat.stats.funds + seat.hand.length,
    };
  });
  return {
    endedBy: state.seats.some(hasReachedEndGoal) ? "end_goal" : "turn_limit",
    places: [...places].sort((first, second) =>
      compareRanks(rankOf(state, first), rankOf(state, second)),
    ),
  };
}
