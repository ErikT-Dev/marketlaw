import * as v from "valibot";
import { SessionToken } from "./SessionToken";

export const CreateRoomRequest = v.strictObject({
  token: SessionToken,
  size: v.number(),
  isPublic: v.boolean(),
  humanCheck: v.pipe(v.string(), v.maxLength(4096)),
});

export type CreateRoomRequest = v.InferOutput<typeof CreateRoomRequest>;
