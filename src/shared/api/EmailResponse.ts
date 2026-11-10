import * as v from "valibot";
import { ReasonCode } from "../ReasonCode";

export const EmailResponse = v.variant("isOk", [
  v.strictObject({ isOk: v.literal(true) }),
  v.strictObject({ isOk: v.literal(false), reason: ReasonCode }),
]);

export type EmailResponse = v.InferOutput<typeof EmailResponse>;
