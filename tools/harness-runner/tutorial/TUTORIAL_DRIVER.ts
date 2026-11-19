import * as v from "valibot";
import { isRecord } from "../../harness-check/isRecord.ts";
import type { DriverSession } from "../DriverSession.ts";
import { readEngineThen } from "../engine/readEngineThen.ts";
import { givenRatingsOf } from "../room/givenRatingsOf.ts";
import type { ScenarioDriver } from "../ScenarioDriver.ts";
import type { ScenarioStep } from "../ScenarioStep.ts";
import { playTutorialUntil } from "./playTutorialUntil.ts";
import { TUTORIAL_GIVEN_SCHEMA } from "./TUTORIAL_GIVEN_SCHEMA.ts";
import { tutorialActionFromStep } from "./tutorialActionFromStep.ts";
import { tutorialRatingsThen } from "./tutorialRatingsThen.ts";
import { tutorialRoomThen } from "./tutorialRoomThen.ts";
import { TutorialSession } from "./TutorialSession.ts";

const TUTORIAL_GAME_FIELDS = ["seats", "turn", "marketplace", "quests", "bonus_types"];
const TUTORIAL_SEAT_FIELDS = new Set(["seat", "stats", "hand", "city", "quests_completed"]);

function playerOf(step: Readonly<Record<string, unknown>>): string {
  if (typeof step["player"] !== "string") {
    throw new Error(`the tutorial step ${JSON.stringify(step)} names no player`);
  }
  return step["player"];
}

function runTutorialStep(session: TutorialSession, step: ScenarioStep): void {
  if (!isRecord(step)) {
    throw new Error(`the tutorial driver cannot run ${JSON.stringify(step)}`);
  }
  if (typeof step["wait_ms"] === "number") {
    session.wait(step["wait_ms"]);
  } else if (typeof step["disconnect"] === "string") {
    session.disconnect();
  } else if (step["action"] === "start_tutorial") {
    session.start(playerOf(step));
  } else if (step["action"] === "leave_tutorial") {
    session.send(playerOf(step), { type: "leave_tutorial" });
  } else {
    session.send(playerOf(step), tutorialActionFromStep(step));
  }
}

function readTutorialThen(session: TutorialSession, field: string, expected: unknown): unknown {
  const { record, lastReply } = session;
  switch (field) {
    case "rejected":
      return lastReply?.type === "rejected" ? lastReply.code : undefined;
    case "unchanged":
      return session.isLastStepUnchanged;
    case "tutorial_step":
    case "tutorial":
    case "tutorial_room":
      return tutorialRoomThen(session, field);
    case "record":
      return session.records.rowCounts().records === 0 ? "none" : "saved";
    case "ratings":
      return tutorialRatingsThen(session, expected);
    default:
      if (record === undefined) {
        throw new Error("the tutorial has not started");
      }
      return readEngineThen(record.tutorial.game, field, expected, session.now);
  }
}

function startSession(rawGiven: Readonly<Record<string, unknown>>): DriverSession {
  const given = v.parse(TUTORIAL_GIVEN_SCHEMA, rawGiven);
  const session = new TutorialSession();
  givenRatingsOf(given, (name) => session.identityNamed(name)).forEach((rating) => {
    session.records.giveRating(rating);
  });
  if (given.tutorial !== undefined) {
    playTutorialUntil(session, given.tutorial.player, given.tutorial.step);
  }
  return {
    runStep: (step) => {
      runTutorialStep(session, step);
    },
    readThen: (field, expected) => readTutorialThen(session, field, expected),
    measurements: () =>
      session.fullTutorialRows === null ? [] : [{ budget: "B6", value: session.fullTutorialRows }],
  };
}

export const TUTORIAL_DRIVER: ScenarioDriver = {
  name: "tutorial",
  givenFields: new Set(["accounts", "tutorial"]),
  steps: new Set([
    "start_tutorial",
    "leave_tutorial",
    "continue",
    "play_card",
    "sell",
    "end_turn",
    "turn_draw",
    "claim_all",
    "complete_quest",
    "redraw_hand",
    "wait_ms",
    "disconnect",
  ]),
  thenFields: new Set([
    "tutorial_step",
    "tutorial",
    "tutorial_room",
    "rejected",
    "unchanged",
    "record",
    "ratings",
    ...TUTORIAL_GAME_FIELDS,
  ]),
  nestedFields: new Map<string, ReadonlySet<string>>([
    ["given.accounts", new Set(["name", "rating"])],
    ["given.tutorial", new Set(["player", "step"])],
    ["then.seats", TUTORIAL_SEAT_FIELDS],
    ["then.marketplace", new Set(["place", "card"])],
    ["then.quests", new Set(["quest"])],
  ]),
  unhandledGivenValues: () => [],
  startSession,
};
