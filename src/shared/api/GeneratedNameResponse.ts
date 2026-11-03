import * as v from "valibot";

export const GeneratedNameResponse = v.strictObject({ name: v.string() });

export type GeneratedNameResponse = v.InferOutput<typeof GeneratedNameResponse>;
