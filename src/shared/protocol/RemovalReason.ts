import * as v from "valibot";

export const RemovalReason = v.picklist([
  "left",
  "declined",
  "timed_out",
  "disconnected",
  "daily_action_limit",
  "daily_game_start_limit",
]);

export type RemovalReason = v.InferOutput<typeof RemovalReason>;
