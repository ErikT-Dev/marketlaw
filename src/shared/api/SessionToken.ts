import * as v from "valibot";

export const SessionToken = v.pipe(v.string(), v.minLength(1), v.maxLength(64));
