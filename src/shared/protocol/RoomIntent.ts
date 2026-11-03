import * as v from "valibot";

export const RoomIntent = v.variant("type", [
  v.strictObject({ type: v.literal("change_size"), size: v.picklist([2, 3, 4]) }),
  v.strictObject({ type: v.literal("leave_room") }),
  v.strictObject({ type: v.literal("accept_game") }),
  v.strictObject({ type: v.literal("decline_game") }),
]);

export type RoomIntent = v.InferOutput<typeof RoomIntent>;
