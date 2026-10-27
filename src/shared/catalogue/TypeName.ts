import * as v from "valibot";

export const TypeName = v.pipe(v.string(), v.minLength(1), v.brand("TypeName"));

export type TypeName = v.InferOutput<typeof TypeName>;
