import type { DriverSession } from "../DriverSession.ts";
import type { ScenarioDriver } from "../ScenarioDriver.ts";
import type { ScenarioStep } from "../ScenarioStep.ts";
import { stepKindOf } from "../stepKindOf.ts";
import type { CardName } from "../../../src/shared/catalogue/CardName.ts";
import { gameMenuEntriesOf } from "../../../src/client/screens/menu/gameMenuEntriesOf.ts";
import type { GameMenuPlace } from "../../../src/client/screens/menu/GameMenuPlace.ts";
import { ANY_CARD } from "../../../src/client/screens/cardSet/ANY_CARD.ts";
import { cardSetFilterAfter } from "./cardSetFilterAfter.ts";
import { cardDetailThen } from "./cardDetailThen.ts";
import { cardSetThen } from "./cardSetThen.ts";
import { menuPlaceOf } from "./menuPlaceOf.ts";
import { openedCardOf } from "./openedCardOf.ts";
import { readRulebook } from "./readRulebook.ts";
import { rulebookCoversThen } from "./rulebookCoversThen.ts";
import { rulesViewerThen } from "./rulesViewerThen.ts";

const DETAIL_FIELDS = [
  "name",
  "sector",
  "tier",
  "base_cost",
  "workforce",
  "quality",
  "satisfaction",
  "product",
  "distribution",
  "types",
  "double_types",
  "combos",
];
const CLIENT_STEPS: ReadonlySet<string> = new Set([
  "open_menu",
  "open_rules",
  "open_card_set",
  "filter_cards",
  "search_cards",
  "open_card",
]);
const CLIENT_THEN_FIELDS: ReadonlySet<string> = new Set([
  "menu",
  "rules_viewer",
  "rulebook_covers",
  "card_set",
  "card_detail",
]);
const CLIENT_NESTED_FIELDS: ReadonlyMap<string, ReadonlySet<string>> = new Map([
  ["given.seats", new Set(["seat", "player"])],
  ["given.accounts", new Set(["name"])],
  ["given.room", new Set(["code", "size", "public", "owner", "players", "state"])],
  ["then.rules_viewer", new Set(["source", "contents", "links_work"])],
  ["then.card_set", new Set(["count", "cards"])],
  ["then.card_detail", new Set(DETAIL_FIELDS)],
]);

function startSession(): DriverSession {
  const openPages = new Set<string>();
  let cardSetFilter = ANY_CARD;
  let openCard: CardName | null = null;
  let menuPlace: GameMenuPlace | null = null;
  return {
    runStep: (step: ScenarioStep) => {
      const kind = stepKindOf(step);
      openPages.add(kind);
      cardSetFilter = cardSetFilterAfter(cardSetFilter, kind, step);
      openCard = kind === "open_card" ? openedCardOf(step) : openCard;
      menuPlace = kind === "open_menu" ? menuPlaceOf(step) : menuPlace;
    },
    readThen: (field: string) => {
      if (field === "menu") {
        return menuPlace === null ? null : gameMenuEntriesOf(menuPlace).map(({ label }) => label);
      }
      if (field === "rules_viewer") {
        return openPages.has("open_rules") ? rulesViewerThen(readRulebook()) : null;
      }
      if (field === "card_set") {
        return openPages.has("open_card_set") ? cardSetThen(cardSetFilter) : null;
      }
      if (field === "card_detail") {
        return openCard === null ? null : cardDetailThen(openCard);
      }
      return rulebookCoversThen(readRulebook());
    },
  };
}

export const CLIENT_DRIVER: ScenarioDriver = {
  name: "client",
  givenFields: new Set(["seats", "accounts", "room"]),
  steps: CLIENT_STEPS,
  thenFields: CLIENT_THEN_FIELDS,
  nestedFields: CLIENT_NESTED_FIELDS,
  unhandledGivenValues: () => [],
  startSession,
};
