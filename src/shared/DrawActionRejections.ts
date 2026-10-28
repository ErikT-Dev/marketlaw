import type { Kind } from "./catalogue/Kind";
import type { Tier } from "./catalogue/Tier";
import type { ReasonCode } from "./ReasonCode";

export type DrawActionRejections = Readonly<
  Record<Kind, Readonly<Record<Tier, ReasonCode | null>>>
>;
