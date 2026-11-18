import * as v from "valibot";
import { TUTORIAL_SCHEMA_VERSION } from "./TUTORIAL_SCHEMA_VERSION";
import type { TutorialRecord } from "./TutorialRecord";

export const STORED_TUTORIAL_SCHEMA = v.custom<TutorialRecord>(
  (value) =>
    typeof value === "object" &&
    value !== null &&
    "schemaVersion" in value &&
    value.schemaVersion === TUTORIAL_SCHEMA_VERSION,
);
