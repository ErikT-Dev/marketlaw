import * as v from "valibot";
import { RankingEntry } from "./RankingEntry";
import { RankingStanding } from "./RankingStanding";

export const RankingResponse = v.strictObject({
  page: v.number(),
  pageCount: v.number(),
  entries: v.array(RankingEntry),
  standing: RankingStanding,
});

export type RankingResponse = v.InferOutput<typeof RankingResponse>;
