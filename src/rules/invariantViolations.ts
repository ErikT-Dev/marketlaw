import { BONUS_PER_FUND } from "./BONUS_PER_FUND";
import { cardOf } from "../shared/catalogue/cardOf";
import { decisionOf } from "./decisionOf";
import { FIRST_TURN_FOR_HIGHER_TIERS } from "./FIRST_TURN_FOR_HIGHER_TIERS";
import { gameEndViolations } from "./gameEndViolations";
import { isInOwnMainPhase } from "./isInOwnMainPhase";
import { isVoteAction } from "./isVoteAction";
import type { GameAction } from "./GameAction";
import type { GameState } from "./GameState";
import type { SeatNumber } from "../shared/SeatNumber";
import { seatOf } from "./seatOf";
import { stateInvariantViolations } from "./stateInvariantViolations";
import { TIME_BANK_MS } from "./TIME_BANK_MS";
import type { Transition } from "./Transition";

function seatsAfter(fromSeat: number, toSeat: number, count: number): number {
  return (toSeat - fromSeat + count) % count;
}

function expectedFirstSeat(state: GameState): number {
  const count = state.seats.length;
  const rotationSeat = ((state.turn - 1) % count) + 1;
  const stillIn = state.seats.filter((seat) => seat.departure === null).map((seat) => seat.seat);
  const byRotation = [...stillIn].sort(
    (first, second) => seatsAfter(rotationSeat, first, count) - seatsAfter(rotationSeat, second, count),
  );
  return byRotation[0] ?? rotationSeat;
}

function holdingPileViolations(before: GameState, after: GameState): ReadonlyArray<string> {
  const isOutsideMainPhase =
    after.turn > before.turn || !after.seats.some((seat) => isInOwnMainPhase(after, seat));
  return isOutsideMainPhase && after.holdingPile.length > 0
    ? [`I2: the holding pile holds ${String(after.holdingPile.length)} cards outside the main phase`]
    : [];
}

function allowedBankGrowthMs(before: GameState, action: GameAction, seat: SeatNumber): number {
  const isEndingOwnTurn = action.type === "end_turn" && action.seat === seat;
  const hasFreeTimeAgain = before.grace.some((entry) => entry.seat === seat);
  return isEndingOwnTurn && !hasFreeTimeAgain ? (decisionOf(before, seat)?.freeMs ?? 0) : 0;
}

function timeBankViolations({ before, action }: Transition, after: GameState): ReadonlyArray<string> {
  return after.seats.flatMap((afterSeat) => {
    const bank = afterSeat.timeBankMs;
    const bankBefore = seatOf(before, afterSeat.seat)?.timeBankMs ?? bank;
    const isOutOfRange = bank < 0 || bank > TIME_BANK_MS;
    return isOutOfRange || bank > bankBefore + allowedBankGrowthMs(before, action, afterSeat.seat)
      ? [`I19: seat ${String(afterSeat.seat)} time bank went from ${String(bankBefore)} to ${String(bank)}`]
      : [];
  });
}

function incomeViolations(before: GameState, after: GameState): ReadonlyArray<string> {
  return after.seats.flatMap((afterSeat) => {
    const income = afterSeat.stats.income;
    const incomeBefore = seatOf(before, afterSeat.seat)?.stats.income ?? income;
    if (income < incomeBefore) {
      return [`I8: seat ${String(afterSeat.seat)} income went from ${String(incomeBefore)} to ${String(income)}`];
    }
    return income < 3 ? [`I8: seat ${String(afterSeat.seat)} income is below 3`] : [];
  });
}

function actorViolations({ before, action }: Transition): ReadonlyArray<string> {
  const seat = seatOf(before, action.seat);
  const isOutOfTurnAllowed = action.type === "leave_game" || isVoteAction(action);
  const isActorOut =
    action.type !== "close_vote" &&
    seat !== undefined &&
    (seat.departure !== null || (seat.isDone && !isOutOfTurnAllowed));
  return isActorOut ? [`I18: seat ${action.seat} took an action while done or after leaving`] : [];
}

function acceptedViolations(transition: Transition, after: GameState): ReadonlyArray<string> {
  const { before, action } = transition;
  const seat = seatOf(before, action.seat);
  const actor = actorViolations(transition);
  const play =
    action.type === "play_card" && seat !== undefined
      ? [
          ...(cardOf(action.card).tier > 1 && before.turn < FIRST_TURN_FOR_HIGHER_TIERS
            ? [`I5: ${action.card} was played in turn ${before.turn}`]
            : []),
          ...(seat.buildPasses === 0
            ? [`I6: seat ${action.seat} played more cards than its build passes allow`]
            : []),
        ]
      : [];
  const bonus =
    after.turn > before.turn
      ? after.seats
          .filter((afterSeat) => afterSeat.stats.bonus >= BONUS_PER_FUND)
          .map((afterSeat) => `I10: seat ${afterSeat.seat} kept a bonus of 10 or more`)
      : [];
  const firstPlayer =
    after.turn > before.turn && after.firstPlayer !== expectedFirstSeat(after)
      ? [`I20: turn ${String(after.turn)} starts with seat ${String(after.firstPlayer)} first`]
      : [];
  return [
    ...actor,
    ...play,
    ...bonus,
    ...firstPlayer,
    ...holdingPileViolations(before, after),
    ...incomeViolations(before, after),
    ...timeBankViolations(transition, after),
    ...gameEndViolations(before, after),
    ...stateInvariantViolations(after),
  ];
}

export function invariantViolations(transition: Transition): ReadonlyArray<string> {
  if (transition.outcome.isOk) {
    return acceptedViolations(transition, transition.outcome.value);
  }
  return JSON.stringify(transition.before) === transition.beforeAsText
    ? []
    : ["I27: a rejected action changed the game state"];
}
