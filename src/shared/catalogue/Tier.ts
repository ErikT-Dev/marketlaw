import * as v from "valibot";

export const Tier = v.picklist([1, 2, 3]);

export type Tier = v.InferOutput<typeof Tier>;
