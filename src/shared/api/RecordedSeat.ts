import * as v from "valibot";
import { TypeName } from "../catalogue/TypeName";
import { ProjectName } from "../ProjectName";

export const RecordedSeat = v.strictObject({
  seat: v.picklist([1, 2, 3, 4]),
  result: v.picklist(["won", "lost", "left"]),
  place: v.number(),
  leftInTurn: v.nullable(v.number()),
  score: v.number(),
  hasReachedEndGoal: v.boolean(),
  income: v.number(),
  fundsAndHand: v.number(),
  workforce: v.number(),
  quality: v.number(),
  satisfaction: v.number(),
  product: v.number(),
  distribution: v.number(),
  influence: v.number(),
  bonusTypePoints: v.number(),
  projects: v.array(ProjectName),
  questsCompleted: v.number(),
  comboGains: v.strictObject({
    workforce: v.number(),
    quality: v.number(),
    satisfaction: v.number(),
  }),
  typeCounts: v.record(TypeName, v.number()),
});

export type RecordedSeat = v.InferOutput<typeof RecordedSeat>;
