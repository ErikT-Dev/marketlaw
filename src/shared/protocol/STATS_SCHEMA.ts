import * as v from "valibot";

export const STATS_SCHEMA = v.object({
  funds: v.number(),
  income: v.number(),
  influence: v.number(),
  workforce: v.number(),
  quality: v.number(),
  satisfaction: v.number(),
  product: v.number(),
  distribution: v.number(),
});
