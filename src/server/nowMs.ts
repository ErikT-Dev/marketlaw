import * as v from "valibot";
import { EpochMs } from "../shared/EpochMs";

export function nowMs(): EpochMs {
  return v.parse(EpochMs, Date.now());
}
