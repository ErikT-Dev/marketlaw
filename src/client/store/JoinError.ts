import type { EpochMs } from "../../shared/EpochMs";
import type { ReasonCode } from "../../shared/ReasonCode";

export type JoinError = {
  readonly code: string;
  readonly reason: ReasonCode;
  readonly rejoinAt: EpochMs | null;
};
