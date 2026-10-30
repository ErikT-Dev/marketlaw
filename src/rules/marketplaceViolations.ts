import { cardOf } from "../shared/catalogue/cardOf";
import { kindOf } from "../shared/catalogue/kindOf";
import type { GameState } from "./GameState";
import { MARKET_PHASES_SHOWN } from "./MARKET_PHASES_SHOWN";
import { MARKETPLACE_PLACES } from "./MARKETPLACE_PLACES";

const MARKETPLACE_SIZE = 8;

function placeCountViolations(state: GameState): ReadonlyArray<string> {
  const places = state.marketplace.map(({ place }) => place);
  const tooMany =
    places.length > MARKETPLACE_SIZE
      ? [`I3: the marketplace has ${String(places.length)} places`]
      : [];
  const twice = places.filter((place, index) => places.indexOf(place) === index && places.lastIndexOf(place) !== index);
  return [...tooMany, ...twice.map((place) => `I3: the ${place} place is listed more than once`)];
}

export function marketplaceViolations(state: GameState): ReadonlyArray<string> {
  return [
    ...placeCountViolations(state),
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
