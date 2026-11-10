import * as v from "valibot";

export const TestOutboxRequest = v.strictObject({ to: v.pipe(v.string(), v.maxLength(1024)) });

export type TestOutboxRequest = v.InferOutput<typeof TestOutboxRequest>;
