import type { TypeName } from "../../shared/catalogue/TypeName";
import type { StatName } from "../icons/StatName";

export type IconTextPart =
  | string
  | { readonly stat: StatName; readonly value?: number | string }
  | { readonly type: TypeName; readonly count?: number };
