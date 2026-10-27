import * as v from "valibot";

export const Kind = v.picklist([
  "Residential",
  "Industry",
  "Service",
  "Public quality card",
  "Public satisfaction card",
]);

export type Kind = v.InferOutput<typeof Kind>;
