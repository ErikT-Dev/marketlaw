import type { DriverSession } from "../DriverSession.ts";
import type { ScenarioDriver } from "../ScenarioDriver.ts";
import type { ScenarioStep } from "../ScenarioStep.ts";
import { stepKindOf } from "../stepKindOf.ts";
import { ANY_CARD } from "../../../src/client/screens/cardSet/ANY_CARD.ts";
import { cardSetFilterAfter } from "./cardSetFilterAfter.ts";
import { cardSetThen } from "./cardSetThen.ts";
import { readRulebook } from "./readRulebook.ts";
import { rulebookCoversThen } from "./rulebookCoversThen.ts";
import { rulesViewerThen } from "./rulesViewerThen.ts";

const CLIENT_STEPS: ReadonlySet<string> = new Set([
  "open_rules",
  "open_card_set",
  "filter_cards",
  "search_cards",
]);
const CLIENT_THEN_FIELDS: ReadonlySet<string> = new Set([
  "rules_viewer",
  "rulebook_covers",
  "card_set",
]);
const CLIENT_NESTED_FIELDS: ReadonlyMap<string, ReadonlySet<string>> = new Map([
  ["then.rules_viewer", new Set(["source", "contents", "links_work"])],
  ["then.card_set", new Set(["count", "cards"])],
]);

function startSession(): DriverSession {
  const openPages = new Set<string>();
  let cardSetFilter = ANY_CARD;
  return {
    runStep: (step: ScenarioStep) => {
      const kind = stepKindOf(step);
      openPages.add(kind);
      cardSetFilter = cardSetFilterAfter(cardSetFilter, kind, step);
    },
    readThen: (field: string) => {
      if (field === "rules_viewer") {
        return openPages.has("open_rules") ? rulesViewerThen(readRulebook()) : null;
      }
      if (field === "card_set") {
        return openPages.has("open_card_set") ? cardSetThen(cardSetFilter) : null;
      }
      return rulebookCoversThen(readRulebook());
    },
  };
}

export const CLIENT_DRIVER: ScenarioDriver = {
  name: "client",
  givenFields: new Set(),
  steps: CLIENT_STEPS,
  thenFields: CLIENT_THEN_FIELDS,
  nestedFields: CLIENT_NESTED_FIELDS,
  unhandledGivenValues: () => [],
  startSession,
};
