import type { EpochMs } from "../../shared/EpochMs";
import type { ReasonCode } from "../../shared/ReasonCode";

export type ChatRefusal = {
  readonly code: ReasonCode;
  readonly sendAgainAt: EpochMs | null;
};
