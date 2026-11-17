import * as v from "valibot";
import { RankingPage } from "./RankingPage";
import { SessionToken } from "./SessionToken";

export const RankingRequest = v.strictObject({
  token: v.nullable(SessionToken),
  page: RankingPage,
});

export type RankingRequest = v.InferOutput<typeof RankingRequest>;
