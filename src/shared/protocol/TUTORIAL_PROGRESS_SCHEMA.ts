import * as v from "valibot";
import { TUTORIAL_STEP_IDS } from "../TUTORIAL_STEP_IDS";

export const TUTORIAL_PROGRESS_SCHEMA = v.variant("kind", [
  v.object({
    kind: v.literal("step"),
    step: v.picklist(TUTORIAL_STEP_IDS),
    number: v.number(),
  }),
  v.object({ kind: v.literal("complete") }),
]);
