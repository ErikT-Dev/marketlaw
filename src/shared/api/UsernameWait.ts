import * as v from "valibot";
import { EpochMs } from "../EpochMs";

export const UsernameWait = v.strictObject({ allowedAt: EpochMs });

export type UsernameWait = v.InferOutput<typeof UsernameWait>;
