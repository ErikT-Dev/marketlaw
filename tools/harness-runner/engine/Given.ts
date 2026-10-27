import type * as v from "valibot";
import type { GIVEN_SCHEMA } from "./GIVEN_SCHEMA.ts";

export type Given = v.InferOutput<typeof GIVEN_SCHEMA>;
