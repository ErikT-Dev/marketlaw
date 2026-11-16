import type { DailyLimitReason } from "../DailyLimitReason";
import type { EpochMs } from "../EpochMs";
import type { RankedGameSize } from "../RankedGameSize";

export type OwnQueueState =
  | {
      readonly kind: "out";
      readonly rejoinAt: EpochMs | null;
      readonly dailyLimit: DailyLimitReason | null;
    }
  | { readonly kind: "waiting"; readonly sizes: ReadonlyArray<RankedGameSize> }
  | {
      readonly kind: "confirming";
      readonly size: RankedGameSize;
      readonly deadline: EpochMs;
      readonly isConfirmed: boolean;
    };
