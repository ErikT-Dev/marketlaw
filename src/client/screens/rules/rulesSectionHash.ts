import { RULES_HASH } from "./RULES_HASH";

export function rulesSectionHash(anchor: string): string {
  return `${RULES_HASH}/${anchor}`;
}
