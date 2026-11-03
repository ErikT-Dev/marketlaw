import * as v from "valibot";

export const HumanCheckResponse = v.strictObject({ siteKey: v.nullable(v.string()) });

export type HumanCheckResponse = v.InferOutput<typeof HumanCheckResponse>;
