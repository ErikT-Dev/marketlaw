import type { DriverSession } from "../DriverSession.ts";
import type { ScenarioDriver } from "../ScenarioDriver.ts";
import type { ScenarioStep } from "../ScenarioStep.ts";
import { stepKindOf } from "../stepKindOf.ts";
import { readRulebook } from "./readRulebook.ts";
import { rulebookCoversThen } from "./rulebookCoversThen.ts";
import { rulesViewerThen } from "./rulesViewerThen.ts";

const CLIENT_STEPS: ReadonlySet<string> = new Set(["open_rules"]);
const CLIENT_THEN_FIELDS: ReadonlySet<string> = new Set(["rules_viewer", "rulebook_covers"]);
const CLIENT_NESTED_FIELDS: ReadonlyMap<string, ReadonlySet<string>> = new Map([
  ["then.rules_viewer", new Set(["source", "contents", "links_work"])],
]);

function startSession(): DriverSession {
  const openPages = new Set<string>();
  return {
    runStep: (step: ScenarioStep) => {
      openPages.add(stepKindOf(step));
    },
    readThen: (field: string) => {
      if (field === "rules_viewer") {
        return openPages.has("open_rules") ? rulesViewerThen(readRulebook()) : null;
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
