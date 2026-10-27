import type { TypeName } from "./TypeName";

export type CardTypeCount = {
  readonly type: TypeName;
  readonly count: 1 | 2;
};
