import type { GameState } from "./GameState";
import { isAbandoned } from "../shared/isAbandoned";
import type { PlaceResult } from "../shared/PlaceResult";
import { bonusTypePointsOf } from "./bonusTypePointsOf";
import { hasReachedEndGoal } from "./hasReachedEndGoal";
import { playerOrderOf } from "./playerOrderOf";

const FORMULA = [
  ["income", 0.65],
  ["workforce", 0.7],
  ["quality", 0.55],
  ["satisfaction", 0.5],
  ["product", 2.75],
  ["distribution", 2.25],
] as const;

function expectedScore(state: GameState, seatNumber: number): number | undefined {
  const seat = state.seats.find((candidate) => candidate.seat === seatNumber);
  if (seat === undefined) {
    return undefined;
  }
  const parts = [
    ...FORMULA.map(([stat, weight]) => weight * seat.stats[stat]),
    0.02 * seat.stats.funds,
    0.2 * (seat.departure?.cardsInHand ?? seat.hand.length),
    bonusTypePointsOf(seat, state.bonusTypes),
  ];
  const hundredths = parts.reduce((sum, part) => sum + Math.round(part * 100), 0);
  return Math.floor(hundredths / 100);
}

function hasLeft(place: PlaceResult): boolean {
  return place.leftInTurn !== null;
}

function tieBreakOf(state: GameState, place: PlaceResult): readonly [number, number] {
  const seat = state.seats.find((candidate) => candidate.seat === place.seat);
  return [-(seat?.worthGained ?? 0), playerOrderOf(state).indexOf(place.seat)];
}

function isEndGoalOf(state: GameState, place: PlaceResult): boolean {
  const seat = state.seats.find((candidate) => candidate.seat === place.seat);
  return seat !== undefined && hasReachedEndGoal(seat);
}

function isPlacedBefore(state: GameState, place: PlaceResult, next: PlaceResult): boolean {
  if (hasLeft(place)) {
    return hasLeft(next) && state.leaveOrder.indexOf(place.seat) > state.leaveOrder.indexOf(next.seat);
  }
  if (hasLeft(next) || isEndGoalOf(state, place) !== isEndGoalOf(state, next)) {
    return hasLeft(next) || isEndGoalOf(state, place);
  }
  return place.score >= next.score;
}

function isTieBrokenInOrder(state: GameState, place: PlaceResult, next: PlaceResult): boolean {
  if (
    hasLeft(place) ||
    hasLeft(next) ||
    place.score !== next.score ||
    isEndGoalOf(state, place) !== isEndGoalOf(state, next)
  ) {
    return true;
  }
  const [placeWorth, placeOrder] = tieBreakOf(state, place);
  const [nextWorth, nextOrder] = tieBreakOf(state, next);
  return placeWorth < nextWorth || (placeWorth === nextWorth && placeOrder < nextOrder);
}

export function gameEndViolations(before: GameState, after: GameState): ReadonlyArray<string> {
  if (after.phase !== "ended" || before.phase === "ended") {
    return [];
  }
  const places = after.result?.places ?? [];
  const seats = places.map(({ seat }) => seat);
  const isEverySeatOnce =
    seats.length === after.seats.length && new Set(seats).size === after.seats.length;
  const wrongScores = places
    .filter(({ seat, score }) => expectedScore(after, seat) !== score)
    .map(({ seat }) => `I22: seat ${String(seat)}'s score does not follow the formula`);
  const isOrdered = places.every((place, index) => {
    const next = places[index + 1];
    return next === undefined || isPlacedBefore(after, place, next);
  });
  const isTieBroken = places.every((place, index) => {
    const next = places[index + 1];
    return next === undefined || isTieBrokenInOrder(after, place, next);
  });
  return [
    ...(isEverySeatOnce ? [] : ["I22: the places do not hold every seat exactly once"]),
    ...wrongScores,
    ...(isOrdered
      ? []
      : ["I22: the places are not by end goal and then score with players who left last, the first to leave last"]),
    ...(isTieBroken
      ? []
      : ["I22: equal scores are not placed by total worth gained and then the player order"]),
    ...((after.result !== null && isAbandoned(after.result.endedBy)) || places[0]?.leftInTurn === null
      ? []
      : ["I22: the winner has left or there is none"]),
  ];
}
