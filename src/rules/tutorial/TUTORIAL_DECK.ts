import { CARD_NAMES } from "../../shared/catalogue/CARD_NAMES";
import type { CardName } from "../../shared/catalogue/CardName";
import { TUTORIAL_STEP_IDS } from "../../shared/TUTORIAL_STEP_IDS";
import { TUTORIAL_SETUP } from "./TUTORIAL_SETUP";
import { TUTORIAL_STEPS } from "./TUTORIAL_STEPS";

const DRAWN_IN_ORDER: ReadonlyArray<CardName> = TUTORIAL_STEP_IDS.flatMap(
  (step) => TUTORIAL_STEPS[step].draws,
);

const PLACED_AT_SETUP: ReadonlyArray<CardName> = [
  ...TUTORIAL_SETUP.hand,
  ...Object.values(TUTORIAL_SETUP.marketplace),
  ...DRAWN_IN_ORDER,
];

export const TUTORIAL_DECK: ReadonlyArray<CardName> = [
  ...DRAWN_IN_ORDER,
  ...CARD_NAMES.filter((name) => !PLACED_AT_SETUP.includes(name)),
];
