import * as v from "valibot";
import { SessionToken } from "./SessionToken";

export const CreateRoomRequest = v.strictObject({
  token: SessionToken,
  size: v.picklist([2, 3, 4]),
});

export type CreateRoomRequest = v.InferOutput<typeof CreateRoomRequest>;
