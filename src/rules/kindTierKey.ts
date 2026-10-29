import type { Kind } from "../shared/catalogue/Kind";
import type { Tier } from "../shared/catalogue/Tier";

export function kindTierKey(kind: Kind, tier: Tier): string {
  return `${kind}|${String(tier)}`;
}
