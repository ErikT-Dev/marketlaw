import * as v from "valibot";
import { SessionToken } from "./SessionToken";

export const SessionRequest = v.strictObject({ token: SessionToken });

export type SessionRequest = v.InferOutput<typeof SessionRequest>;
