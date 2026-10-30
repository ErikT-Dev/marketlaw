import * as v from "valibot";
import { applyDueTimeOuts } from "../../../src/rules/applyDueTimeOuts.ts";
import { earliestDeadline } from "../../../src/rules/earliestDeadline.ts";
import type { GameState } from "../../../src/rules/GameState.ts";
import { receiveAction } from "../../../src/rules/receiveAction.ts";
import type { SavedGame } from "../../../src/rules/SavedGame.ts";
import { SAVE_SCHEMA_VERSION } from "../../../src/rules/SAVE_SCHEMA_VERSION.ts";
import { setUpGame } from "../../../src/rules/setUpGame.ts";
import { EpochMs } from "../../../src/shared/EpochMs.ts";
import type { ReasonCode } from "../../../src/shared/ReasonCode.ts";
import { isRecord } from "../../harness-check/isRecord.ts";
import type { DriverSession } from "../DriverSession.ts";
import type { RandomPurpose } from "../RandomPurpose.ts";
import type { ScenarioDriver } from "../ScenarioDriver.ts";
import type { ScenarioStep } from "../ScenarioStep.ts";
import type { ScriptedRandom } from "../ScriptedRandom.ts";
import { actionFromStep } from "./actionFromStep.ts";
import { ENGINE_FIELDS } from "./ENGINE_FIELDS.ts";
import { engineRandom } from "./engineRandom.ts";
import { GIVEN_SCHEMA } from "./GIVEN_SCHEMA.ts";
import { readEngineThen } from "./readEngineThen.ts";
import { stateFromGiven } from "./stateFromGiven.ts";

function savedWith(state: GameState): SavedGame {
  return {
    schemaVersion: SAVE_SCHEMA_VERSION,
    seed: 1,
    setup: { players: 2, startedAt: state.clockStartedAt },
    startingState: state,
    actionLog: [],
    state,
  };
}

function waitOf(
  step: ScenarioStep,
): { readonly ms: number; readonly doesAlarmFire: boolean } | null {
  if (!isRecord(step) || typeof step["wait_ms"] !== "number") {
    return null;
  }
  return { ms: step["wait_ms"], doesAlarmFire: step["alarm_fires"] !== false };
}

function startSession(
  rawGiven: Readonly<Record<string, unknown>>,
  scripted: ScriptedRandom,
): DriverSession {
  const given = v.parse(GIVEN_SCHEMA, rawGiven);
  let purpose: RandomPurpose = "play";
  const random = engineRandom({ scripted, purpose: () => purpose, startingDeck: given.deck ?? [] });
  let now = v.parse(EpochMs, given.clock_ms ?? 0);
  let saved: SavedGame | undefined =
    given.phase === "new_game" ? undefined : savedWith(stateFromGiven(given));
  let lastRejection: ReasonCode | undefined;
  let isLastStepUnchanged = false;
  function current(): SavedGame {
    if (saved === undefined) {
      throw new Error("the game has not started");
    }
    return saved;
  }
  function waitFor(ms: number, doesAlarmFire: boolean): void {
    const until = v.parse(EpochMs, now + ms);
    for (
      let deadline = earliestDeadline(current().state);
      doesAlarmFire && deadline !== null && deadline <= until;
      deadline = earliestDeadline(current().state)
    ) {
      now = v.parse(EpochMs, deadline);
      saved = applyDueTimeOuts(current(), now, () => random);
    }
    now = until;
  }
  return {
    runStep(step) {
      if (step === "start_game") {
        purpose = "setup";
        saved = savedWith(setUpGame({ players: given.players ?? 2, startedAt: now }, random));
        purpose = "play";
        return;
      }
      const wait = waitOf(step);
      if (wait !== null) {
        waitFor(wait.ms, wait.doesAlarmFire);
        return;
      }
      const beforeAsText = JSON.stringify(current().state);
      const received = receiveAction(current(), actionFromStep(step), now, () => random);
      lastRejection = received.rejection?.code;
      saved = received.saved;
      isLastStepUnchanged = JSON.stringify(received.saved.state) === beforeAsText;
    },
    readThen(field, expected) {
      if (field === "rejected") {
        return lastRejection;
      }
      return field === "unchanged"
        ? isLastStepUnchanged
        : readEngineThen(current().state, field, expected, now);
    },
  };
}

export const ENGINE_DRIVER: ScenarioDriver = {
  name: "engine",
  ...ENGINE_FIELDS,
  steps: new Set([...ENGINE_FIELDS.steps, "wait_ms"]),
  startSession,
};
