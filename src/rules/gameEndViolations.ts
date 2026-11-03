import type { GameState } from "./GameState";
import type { PlaceResult } from "../shared/PlaceResult";
import { bonusTypePointsOf } from "./bonusTypePointsOf";
import { playerOrderOf } from "./playerOrderOf";

const FORMULA = [
  ["income", 6.5],
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
    870,
    -25 * (state.turn - 1),
    ...FORMULA.map(([stat, weight]) => weight * seat.stats[stat]),
    0.2 * (seat.stats.funds + seat.hand.length),
    bonusTypePointsOf(seat, state.bonusTypes),
  ];
  const hundredths = parts.reduce((sum, part) => sum + Math.round(part * 100), 0);
  return Math.floor(hundredths / 100);
}

function tieBreakOf(state: GameState, place: PlaceResult): readonly [number, number] {
  const doneIndex = state.doneOrder.indexOf(place.seat);
  return [
    doneIndex === -1 ? state.seats.length : doneIndex,
    playerOrderOf(state).indexOf(place.seat),
  ];
}

function isPlacedBefore(state: GameState, place: PlaceResult, next: PlaceResult): boolean {
  if (place.hasLeft) {
    return next.hasLeft && state.leaveOrder.indexOf(place.seat) > state.leaveOrder.indexOf(next.seat);
  }
  return next.hasLeft || place.score >= next.score;
}

function isTieBrokenInOrder(state: GameState, place: PlaceResult, next: PlaceResult): boolean {
  if (place.hasLeft || next.hasLeft || place.score !== next.score) {
    return true;
  }
  const [placeDone, placeOrder] = tieBreakOf(state, place);
  const [nextDone, nextOrder] = tieBreakOf(state, next);
  return placeDone < nextDone || (placeDone === nextDone && placeOrder < nextOrder);
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
      : ["I22: the places are not in score order with players who left last, the first to leave last"]),
    ...(isTieBroken
      ? []
      : ["I22: equal scores are not placed by the done order and then the player order"]),
    ...(after.result?.endedBy === "abandoned" || places[0]?.hasLeft === false
      ? []
      : ["I22: the winner has left or there is none"]),
  ];
}
