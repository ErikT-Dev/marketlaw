import { CARD_NAMES } from "../shared/catalogue/CARD_NAMES";
import { ACTION_LIMIT } from "./ACTION_LIMIT";
import type { GameState } from "./GameState";
import { marketplaceViolations } from "./marketplaceViolations";
import { progressViolations } from "./progressViolations";

function cardPlaceViolations(state: GameState): ReadonlyArray<string> {
  const placed = [
    ...state.deck,
    ...state.discard,
    ...state.holdingPile,
    ...state.marketplace.flatMap(({ card }) => (card === null ? [] : [card])),
    ...state.seats.flatMap((seat) => [...seat.hand, ...seat.city]),
  ];
  const missing = CARD_NAMES.filter((name) => !placed.includes(name));
  const twice = placed.filter((name, index) => placed.indexOf(name) !== index);
  return [
    ...missing.map((name) => `I1: ${name} is in no place`),
    ...twice.map((name) => `I1: ${name} is in more than one place`),
  ];
}

function seatViolations(state: GameState): ReadonlyArray<string> {
  return state.seats.flatMap((seat) => {
    const { funds, influence, product, distribution } = seat.stats;
    const negative = Object.entries({ funds, influence, product, distribution })
      .filter(([, value]) => value < 0)
      .map(([stat]) => `I7: seat ${seat.seat} has negative ${stat}`);
    const passes = seat.buildPasses < 0 ? [`I7: seat ${seat.seat} has negative build passes`] : [];
    const actions =
      seat.actionsThisTurn > ACTION_LIMIT
        ? [`I17: seat ${seat.seat} took ${seat.actionsThisTurn} actions this turn`]
        : [];
    const { workforce, quality, satisfaction } = seat.stats;
    const canTakeIncome =
      product >= 1 && distribution >= 1 && workforce >= 0 && quality >= 0 && satisfaction >= 0;
    const income = canTakeIncome ? [`I9: seat ${String(seat.seat)} could still take income`] : [];
    return [...negative, ...passes, ...actions, ...income];
  });
}

export function stateInvariantViolations(state: GameState): ReadonlyArray<string> {
  return [
    ...cardPlaceViolations(state),
    ...seatViolations(state),
    ...progressViolations(state),
    ...marketplaceViolations(state),
  ];
}
