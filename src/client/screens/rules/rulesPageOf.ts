import { RULES_HASH } from "./RULES_HASH";
import type { RulesPageAddress } from "./RulesPageAddress";

const RULES_SECTION_HASH = /^#rules\/([a-z0-9-]+)$/;

export function rulesPageOf(hash: string): RulesPageAddress | null {
  if (hash === RULES_HASH) {
    return { sectionAnchor: null };
  }
  const sectionAnchor = RULES_SECTION_HASH.exec(hash)?.[1];
  return sectionAnchor === undefined ? null : { sectionAnchor };
}
