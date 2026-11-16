import type { RankedGameSize } from "../RankedGameSize";

export type QueueNotice = { readonly kind: "match_found"; readonly size: RankedGameSize };
