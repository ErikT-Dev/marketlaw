import { amountsInTenths } from "../shared/amountsInTenths";
import { cardOf } from "../shared/catalogue/cardOf";
import { FUNDS_PER_SOLD_CARD } from "../shared/FUNDS_PER_SOLD_CARD";
import { fundsInTenths } from "../shared/fundsInTenths";
import { influenceDrawOfTier } from "../shared/ruleFiles/influenceDrawOfTier";
import type { GameAction } from "./GameAction";
import type { GameState } from "./GameState";
import { realCostOf } from "./realCostOf";
import { seatOf } from "./seatOf";
import type { SeatState } from "./SeatState";
import { statsGainOf } from "./statsGainOf";
import { tradeCostsOf } from "./tradeCostsOf";
import type { Transition } from "./Transition";

function cardsGainedIn(before: GameState, after: GameState, seat: SeatState["seat"]): number {
  return after.drawLog.slice(before.drawLog.length).reduce((total, entry) => {
    if (entry.seat !== seat || entry.kind === "shuffle") {
      return total;
    }
    const marketCard = entry.kind === "turn_draw" && entry.choice.option === "A" ? 1 : 0;
    return total + entry.count + marketCard;
  }, 0);
}

function fundsPaidFor(action: GameAction, seatBefore: SeatState): number {
  if (action.type === "play_card") {
    return fundsInTenths(realCostOf(cardOf(action.card), seatBefore));
  }
  if (action.type === "influence") {
    return fundsInTenths(tradeCostsOf(seatBefore, action.trade).funds ?? 0);
  }
  if (action.type === "draw_action") {
    return amountsInTenths(influenceDrawOfTier(action.tier)?.costs ?? {}).funds ?? 0;
  }
  return action.type === "sell" ? -fundsInTenths(action.cards.length * FUNDS_PER_SOLD_CARD) : 0;
}

function fundsLostToZeroAtTurnEnd(seatBefore: SeatState): number {
  const { funds } = seatBefore.stats;
  const income = fundsInTenths(seatBefore.stats.income);
  const statsGain = statsGainOf(seatBefore.stats);
  return income + Math.max(0, statsGain) - (Math.max(0, funds + income + statsGain) - funds);
}

function fundsReceivedIn(transition: Transition, after: GameState, seatBefore: SeatState): number {
  const { before, action } = transition;
  const afterSeat = seatOf(after, seatBefore.seat);
  const fundsChange = (afterSeat?.stats.funds ?? 0) - seatBefore.stats.funds;
  const paid = action.seat === seatBefore.seat ? fundsPaidFor(action, seatBefore) : 0;
  const hasTurnEnded = after.turn > before.turn && afterSeat?.departure === null;
  return fundsChange + paid + (hasTurnEnded ? fundsLostToZeroAtTurnEnd(seatBefore) : 0);
}

function expectedWorthAfter(transition: Transition, after: GameState, seatBefore: SeatState): number {
  const { before, action } = transition;
  if (action.type === "undo" && action.seat === seatBefore.seat) {
    return seatBefore.undoPoints.at(-1)?.worthGained ?? seatBefore.worthGained;
  }
  return (
    seatBefore.worthGained +
    fundsInTenths(cardsGainedIn(before, after, seatBefore.seat)) +
    fundsReceivedIn(transition, after, seatBefore)
  );
}

export function worthGainedSumViolations(transition: Transition, after: GameState): ReadonlyArray<string> {
  return transition.before.seats.flatMap((seatBefore) => {
    const worth = seatOf(after, seatBefore.seat)?.worthGained ?? seatBefore.worthGained;
    const expected = expectedWorthAfter(transition, after, seatBefore);
    return worth === expected
      ? []
      : [
          `I30: seat ${String(seatBefore.seat)} total worth gained is ${String(worth)} after ${transition.action.type}, but the cards gained and funds received make ${String(expected)}`,
        ];
  });
}
