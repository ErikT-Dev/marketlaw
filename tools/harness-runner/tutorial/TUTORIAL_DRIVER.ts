import * as v from "valibot";
import { applyTutorialAction } from "../../../src/rules/tutorial/applyTutorialAction.ts";
import { startTutorial } from "../../../src/rules/tutorial/startTutorial.ts";
import type { TutorialState } from "../../../src/rules/tutorial/TutorialState.ts";
import { EpochMs } from "../../../src/shared/EpochMs.ts";
import type { ReasonCode } from "../../../src/shared/ReasonCode.ts";
import { isRecord } from "../../harness-check/isRecord.ts";
import type { DriverSession } from "../DriverSession.ts";
import { readEngineThen } from "../engine/readEngineThen.ts";
import type { ScenarioDriver } from "../ScenarioDriver.ts";
import type { ScenarioStep } from "../ScenarioStep.ts";
import { TUTORIAL_GIVEN_SCHEMA } from "./TUTORIAL_GIVEN_SCHEMA.ts";
import { tutorialActionFromStep } from "./tutorialActionFromStep.ts";
import { tutorialAtStep } from "./tutorialAtStep.ts";

const TUTORIAL_GAME_FIELDS = ["seats", "turn", "marketplace", "quests", "bonus_types"];
const TUTORIAL_SEAT_FIELDS = new Set(["seat", "stats", "hand", "city", "quests_completed"]);

function startSession(rawGiven: Readonly<Record<string, unknown>>): DriverSession {
  const given = v.parse(TUTORIAL_GIVEN_SCHEMA, rawGiven);
  let now = v.parse(EpochMs, 0);
  let tutorial: TutorialState | undefined =
    given.tutorial === undefined ? undefined : tutorialAtStep(given.tutorial.step, now);
  let lastRejection: ReasonCode | undefined;
  let isLastStepUnchanged = false;
  function current(): TutorialState {
    if (tutorial === undefined) {
      throw new Error("the tutorial has not started");
    }
    return tutorial;
  }
  function runAction(step: Readonly<Record<string, unknown>>): void {
    if (step["action"] === "start_tutorial") {
      tutorial = startTutorial(now);
      return;
    }
    const before = current();
    const result = applyTutorialAction(before, tutorialActionFromStep(step), now);
    lastRejection = result.isOk ? undefined : result.error.code;
    tutorial = result.isOk ? result.value : before;
    isLastStepUnchanged = tutorial === before;
  }
  return {
    runStep(step: ScenarioStep) {
      if (!isRecord(step)) {
        throw new Error(`the tutorial driver cannot run ${JSON.stringify(step)}`);
      }
      if (typeof step["wait_ms"] === "number") {
        now = v.parse(EpochMs, now + step["wait_ms"]);
        return;
      }
      runAction(step);
    },
    readThen(field, expected) {
      if (field === "rejected") {
        return lastRejection;
      }
      if (field === "unchanged") {
        return isLastStepUnchanged;
      }
      if (field === "tutorial_step") {
        return tutorial?.stage;
      }
      return readEngineThen(current().game, field, expected, now);
    },
  };
}

export const TUTORIAL_DRIVER: ScenarioDriver = {
  name: "tutorial",
  givenFields: new Set(["accounts", "tutorial"]),
  steps: new Set([
    "start_tutorial",
    "continue",
    "play_card",
    "sell",
    "end_turn",
    "turn_draw",
    "claim_all",
    "complete_quest",
    "wait_ms",
  ]),
  thenFields: new Set(["tutorial_step", "rejected", "unchanged", ...TUTORIAL_GAME_FIELDS]),
  nestedFields: new Map<string, ReadonlySet<string>>([
    ["given.accounts", new Set(["name"])],
    ["given.tutorial", new Set(["player", "step"])],
    ["then.seats", TUTORIAL_SEAT_FIELDS],
    ["then.marketplace", new Set(["place", "card"])],
    ["then.quests", new Set(["quest"])],
  ]),
  unhandledGivenValues: () => [],
  startSession,
};
