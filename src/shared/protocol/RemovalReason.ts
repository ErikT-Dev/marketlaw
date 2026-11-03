import * as v from "valibot";

export const RemovalReason = v.picklist(["left", "declined", "timed_out", "disconnected"]);

export type RemovalReason = v.InferOutput<typeof RemovalReason>;
