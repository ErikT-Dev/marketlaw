import * as v from "valibot";

export const ProjectName = v.picklist(["quality", "satisfaction", "workforce"]);

export type ProjectName = v.InferOutput<typeof ProjectName>;
