import type { EpochMs } from "../../shared/EpochMs";
import type { ReasonCode } from "../../shared/ReasonCode";

export type JoinRejection = {
  readonly reason: ReasonCode;
  readonly rejoinAt: EpochMs | null;
};
