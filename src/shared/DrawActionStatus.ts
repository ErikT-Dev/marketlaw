import type { Kind } from "./catalogue/Kind";
import type { Tier } from "./catalogue/Tier";
import type { ReasonCode } from "./ReasonCode";

export type DrawActionStatus = {
  readonly kind: Kind;
  readonly tier: Tier;
  readonly rejection: ReasonCode | null;
};
