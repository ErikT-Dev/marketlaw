import * as v from "valibot";
import { ReasonCode } from "../ReasonCode";

export const TutorialStartResponse = v.variant("isOk", [
  v.strictObject({ isOk: v.literal(true) }),
  v.strictObject({ isOk: v.literal(false), reason: ReasonCode }),
]);

export type TutorialStartResponse = v.InferOutput<typeof TutorialStartResponse>;
