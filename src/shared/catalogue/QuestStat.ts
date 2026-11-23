import * as v from "valibot";

export const QuestStat = v.picklist([
  "workforce",
  "quality",
  "satisfaction",
  "product",
  "distribution",
]);

export type QuestStat = v.InferOutput<typeof QuestStat>;
