import * as v from "valibot";

export const AccountEmail = v.strictObject({
  address: v.nullable(v.string()),
  isConfirmed: v.boolean(),
  pendingAddress: v.nullable(v.string()),
  wasRemoved: v.boolean(),
});

export type AccountEmail = v.InferOutput<typeof AccountEmail>;
