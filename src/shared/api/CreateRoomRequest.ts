import * as v from "valibot";

export const CreateRoomRequest = v.strictObject({ size: v.picklist([2, 3, 4]) });

export type CreateRoomRequest = v.InferOutput<typeof CreateRoomRequest>;
