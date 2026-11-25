import * as v from "valibot";
import type { ReplayRecord } from "./ReplayRecord";

export const STORED_REPLAY_SCHEMA = v.custom<ReplayRecord>(
  (value) =>
    typeof value === "object" &&
    value !== null &&
    "schemaVersion" in value &&
    typeof value.schemaVersion === "number",
);
