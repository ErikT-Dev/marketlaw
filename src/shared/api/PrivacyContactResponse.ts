import * as v from "valibot";

export const PrivacyContactResponse = v.strictObject({ contact: v.nullable(v.string()) });

export type PrivacyContactResponse = v.InferOutput<typeof PrivacyContactResponse>;
