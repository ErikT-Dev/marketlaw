import * as v from "valibot";
import { SessionToken } from "./SessionToken";

export const JoinRoomRequest = v.strictObject({ token: SessionToken });

export type JoinRoomRequest = v.InferOutput<typeof JoinRoomRequest>;
