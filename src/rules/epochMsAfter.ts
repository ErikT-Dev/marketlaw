import * as v from "valibot";
import { EpochMs } from "../shared/EpochMs";

export function epochMsAfter(start: number, milliseconds: number): EpochMs {
  return v.parse(EpochMs, start + milliseconds);
}
