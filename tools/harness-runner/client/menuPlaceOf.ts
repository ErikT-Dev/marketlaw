import * as v from "valibot";
import type { GameMenuPlace } from "../../../src/client/screens/menu/GameMenuPlace.ts";
import type { ScenarioStep } from "../ScenarioStep.ts";

const OpenMenuStep = v.object({ from: v.picklist(["lobby", "waiting_room", "game"]) });

export function menuPlaceOf(step: ScenarioStep): GameMenuPlace {
  return v.parse(OpenMenuStep, step).from;
}
