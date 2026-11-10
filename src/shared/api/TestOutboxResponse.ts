import * as v from "valibot";

export const TestOutboxResponse = v.strictObject({
  emails: v.array(v.strictObject({ subject: v.string(), text: v.string() })),
});

export type TestOutboxResponse = v.InferOutput<typeof TestOutboxResponse>;
