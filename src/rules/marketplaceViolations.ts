import { cardOf } from "../shared/catalogue/cardOf";
import { kindOf } from "../shared/catalogue/kindOf";
import type { GameState } from "./GameState";
import { MARKET_PHASES_SHOWN } from "./MARKET_PHASES_SHOWN";
import { MARKETPLACE_PLACES } from "./MARKETPLACE_PLACES";

const MARKETPLACE_SIZE = 8;

export function marketplaceViolations(state: GameState): ReadonlyArray<string> {
  const cards = state.marketplace.flatMap(({ card }) => (card === null ? [] : [card]));
  const tooMany =
    state.marketplace.length > MARKETPLACE_SIZE
      ? [`I3: the marketplace has ${String(cards.length)} cards in ${String(state.marketplace.length)} places`]
      : [];
  return [
    ...tooMany,
    ...state.marketplace.flatMap(({ place, card, phasesShown }) => {
      const kind = MARKETPLACE_PLACES[place];
      const wrongKind =
        card !== null && kind !== "open" && kindOf(cardOf(card)) !== kind
          ? [`I3: the ${place} place holds ${card}`]
          : [];
      const tooLong =
        phasesShown > MARKET_PHASES_SHOWN
          ? [`I4: ${String(card)} has been on display during ${String(phasesShown)} market phases`]
          : [];
      return [...wrongKind, ...tooLong];
    }),
  ];
}
