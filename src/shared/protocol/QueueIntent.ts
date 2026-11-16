import type { RankedGameSize } from "../RankedGameSize";

export type QueueIntent =
  | { readonly type: "resync" }
  | { readonly type: "join_queue"; readonly sizes: ReadonlyArray<RankedGameSize> }
  | { readonly type: "change_sizes"; readonly sizes: ReadonlyArray<RankedGameSize> }
  | { readonly type: "leave_queue" }
  | { readonly type: "confirm_match" }
  | { readonly type: "decline_match" };
