import * as v from "valibot";

export const TutorialIntent = v.variant("type", [
  v.strictObject({ type: v.literal("continue") }),
  v.strictObject({ type: v.literal("restart_tutorial") }),
  v.strictObject({ type: v.literal("leave_tutorial") }),
]);

export type TutorialIntent = v.InferOutput<typeof TutorialIntent>;
