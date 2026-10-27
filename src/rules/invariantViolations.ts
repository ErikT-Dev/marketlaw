import { BONUS_PER_FUND } from "./BONUS_PER_FUND";
import { cardOf } from "../shared/catalogue/cardOf";
import { FIRST_TURN_FOR_HIGHER_TIERS } from "./FIRST_TURN_FOR_HIGHER_TIERS";
import type { GameState } from "./GameState";
import { seatOf } from "./seatOf";
import { stateInvariantViolations } from "./stateInvariantViolations";
import type { Transition } from "./Transition";

function acceptedViolations(transition: Transition, after: GameState): ReadonlyArray<string> {
  const { before, action } = transition;
  const seat = seatOf(before, action.seat);
  const actor =
    seat !== undefined && (seat.isDone || seat.hasLeft)
      ? [`I18: seat ${action.seat} took an action while done or after leaving`]
      : [];
  const play =
    action.type === "play_card" && seat !== undefined
      ? [
          ...(cardOf(action.card).tier > 1 && before.turn < FIRST_TURN_FOR_HIGHER_TIERS
            ? [`I5: ${action.card} was played in turn ${before.turn}`]
            : []),
          ...(seat.hasSkippedBuild || (seat.hasPlayedThisTurn && seat.buildPasses === 0)
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
  return [...actor, ...play, ...bonus, ...stateInvariantViolations(after)];
}

export function invariantViolations(transition: Transition): ReadonlyArray<string> {
  if (transition.outcome.isOk) {
    return acceptedViolations(transition, transition.outcome.value);
  }
  return JSON.stringify(transition.before) === transition.beforeAsText
    ? []
    : ["I27: a rejected action changed the game state"];
}
