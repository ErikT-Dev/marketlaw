import * as v from "valibot";

export const ComboStat = v.picklist(["workforce", "quality", "satisfaction"]);

export type ComboStat = v.InferOutput<typeof ComboStat>;
