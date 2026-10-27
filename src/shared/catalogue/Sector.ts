import * as v from "valibot";

export const Sector = v.picklist(["Residential", "Industry", "Service", "Public"]);

export type Sector = v.InferOutput<typeof Sector>;
