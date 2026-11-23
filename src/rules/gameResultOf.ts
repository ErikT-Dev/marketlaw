import type { GameEnding } from "../shared/GameEnding";
import type { GameResult } from "../shared/GameResult";
import type { PlaceResult } from "../shared/PlaceResult";
import { wholeFundsOf } from "../shared/wholeFundsOf";
import { cardsInHandScoredOf } from "./cardsInHandScoredOf";
import { bonusTypePointsOf } from "./bonusTypePointsOf";
import type { GameState } from "./GameState";
import { hasReachedEndGoal } from "./hasReachedEndGoal";
import { playerOrderOf } from "./playerOrderOf";
import { scoreOf } from "./scoreOf";
import { scorePartsOf } from "./scorePartsOf";

function rankOf(state: GameState, place: PlaceResult): ReadonlyArray<number> {
  const orderIndex = playerOrderOf(state).indexOf(place.seat);
  const worthGained = state.seats.find((seat) => seat.seat === place.seat)?.worthGained ?? 0;
  return [
    place.leftInTurn === null ? 0 : 1,
    -state.leaveOrder.indexOf(place.seat),
    place.hasReachedEndGoal ? 0 : 1,
    -place.score,
    -worthGained,
    orderIndex === -1 ? state.seats.length : orderIndex,
    place.seat,
  ];
}

function compareRanks(first: ReadonlyArray<number>, second: ReadonlyArray<number>): number {
  const index = first.findIndex((value, at) => value !== second[at]);
  return index === -1 ? 0 : (first[index] ?? 0) - (second[index] ?? 0);
}

export function gameResultOf(state: GameState, endedBy: GameEnding): GameResult {
  const places = state.seats.map((seat) => {
    const bonusTypePoints = bonusTypePointsOf(seat, state.bonusTypes);
    const scorePartsInHundredths = scorePartsOf(seat, bonusTypePoints);
    return {
      seat: seat.seat,
      score: scoreOf(scorePartsInHundredths),
      scorePartsInHundredths,
      bonusTypePoints,
      leftInTurn: seat.departure?.turn ?? null,
      hasReachedEndGoal: hasReachedEndGoal(seat),
      income: seat.stats.income,
      fundsAndHand: wholeFundsOf(seat.stats.funds) + cardsInHandScoredOf(seat),
    };
  });
  return {
    endedBy,
    places: [...places].sort((first, second) =>
      compareRanks(rankOf(state, first), rankOf(state, second)),
    ),
  };
}
