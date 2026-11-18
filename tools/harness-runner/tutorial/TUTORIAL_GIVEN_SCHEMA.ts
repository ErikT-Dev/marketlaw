import * as v from "valibot";
import { TUTORIAL_STEP_IDS } from "../../../src/shared/TUTORIAL_STEP_IDS.ts";

export const TUTORIAL_GIVEN_SCHEMA = v.strictObject({
  accounts: v.array(v.strictObject({ name: v.string(), rating: v.optional(v.number()) })),
  tutorial: v.optional(v.strictObject({ player: v.string(), step: v.picklist(TUTORIAL_STEP_IDS) })),
});
