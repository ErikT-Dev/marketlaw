import * as v from "valibot";
import { apply } from "../../../src/rules/apply.ts";
import type { GameState } from "../../../src/rules/GameState.ts";
import { setUpGame } from "../../../src/rules/setUpGame.ts";
import type { ReasonCode } from "../../../src/shared/ReasonCode.ts";
import type { DriverSession } from "../DriverSession.ts";
import type { RandomPurpose } from "../RandomPurpose.ts";
import type { ScenarioDriver } from "../ScenarioDriver.ts";
import type { ScriptedRandom } from "../ScriptedRandom.ts";
import { actionFromStep } from "./actionFromStep.ts";
import { ENGINE_FIELDS } from "./ENGINE_FIELDS.ts";
import { engineRandom } from "./engineRandom.ts";
import { GIVEN_SCHEMA } from "./GIVEN_SCHEMA.ts";
import { readEngineThen } from "./readEngineThen.ts";
import { stateFromGiven } from "./stateFromGiven.ts";

function startSession(
  rawGiven: Readonly<Record<string, unknown>>,
  scripted: ScriptedRandom,
): DriverSession {
  const given = v.parse(GIVEN_SCHEMA, rawGiven);
  let purpose: RandomPurpose = "play";
  const random = engineRandom({ scripted, purpose: () => purpose, startingDeck: given.deck ?? [] });
  let state: GameState | undefined = given.phase === "new_game" ? undefined : stateFromGiven(given);
  let lastRejection: ReasonCode | undefined;
  let isLastStepUnchanged = false;
  function current(): GameState {
    if (state === undefined) {
      throw new Error("the game has not started");
    }
    return state;
  }
  return {
    runStep(step) {
      if (step === "start_game") {
        purpose = "setup";
        state = setUpGame({ players: given.players ?? 2 }, random);
        purpose = "play";
        return;
      }
      const before = current();
      const result = apply(before, actionFromStep(step), random);
      lastRejection = result.isOk ? undefined : result.error.code;
      state = result.isOk ? result.value : before;
      isLastStepUnchanged = JSON.stringify(before) === JSON.stringify(state);
    },
    readThen(field, expected) {
      if (field === "rejected") {
        return lastRejection;
      }
      return field === "unchanged"
        ? isLastStepUnchanged
        : readEngineThen(current(), field, expected);
    },
  };
}

export const ENGINE_DRIVER: ScenarioDriver = {
  name: "engine",
  ...ENGINE_FIELDS,
  startSession,
};
