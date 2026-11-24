import * as v from "valibot";
import { TENTHS_PER_FUND } from "../../../src/shared/TENTHS_PER_FUND.ts";

export const FUNDS_IN_TENTHS = v.pipe(
  v.number(),
  v.transform((funds) => Math.round(funds * TENTHS_PER_FUND)),
);
