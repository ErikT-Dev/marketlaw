import type { EpochMs } from "../../shared/EpochMs";
import type { RemovalReason } from "../../shared/protocol/RemovalReason";

export type RemovalNotice = {
  readonly code: string;
  readonly reason: Exclude<RemovalReason, "left">;
  readonly rejoinAt: EpochMs | null;
};
