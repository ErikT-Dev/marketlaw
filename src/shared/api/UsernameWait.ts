import * as v from "valibot";
import { EpochMs } from "../EpochMs";

export const UsernameWait = v.strictObject({ changedAt: EpochMs, allowedAt: EpochMs });

export type UsernameWait = v.InferOutput<typeof UsernameWait>;
