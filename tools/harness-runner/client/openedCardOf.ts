import * as v from "valibot";
import { CardName } from "../../../src/shared/catalogue/CardName.ts";
import type { ScenarioStep } from "../ScenarioStep.ts";

const OpenCardStep = v.object({ card: CardName });

export function openedCardOf(step: ScenarioStep): CardName {
  return v.parse(OpenCardStep, step).card;
}
