import * as v from "valibot";
import { SessionToken } from "./SessionToken";

const COUNT = v.pipe(v.number(), v.integer(), v.minValue(0));

export const TestDailyCountsRequest = v.strictObject({
  token: SessionToken,
  actions: COUNT,
  gameStarts: COUNT,
});
