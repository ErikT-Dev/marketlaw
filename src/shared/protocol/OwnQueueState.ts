import type { EpochMs } from "../EpochMs";
import type { RankedGameSize } from "../RankedGameSize";

export type OwnQueueState =
  | { readonly kind: "out" }
  | { readonly kind: "waiting"; readonly sizes: ReadonlyArray<RankedGameSize> }
  | { readonly kind: "confirming"; readonly size: RankedGameSize; readonly deadline: EpochMs };
