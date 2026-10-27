import * as v from "valibot";
import { TYPE_NAMES } from "./TYPE_NAMES";

export const TypeName = v.picklist(TYPE_NAMES);

export type TypeName = v.InferOutput<typeof TypeName>;
