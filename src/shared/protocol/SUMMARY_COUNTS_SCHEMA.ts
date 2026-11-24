import * as v from "valibot";

export const SUMMARY_COUNTS_SCHEMA = v.strictObject({
  questsCompleted: v.number(),
  types: v.number(),
  combosClaimed: v.number(),
  worthGained: v.number(),
});
