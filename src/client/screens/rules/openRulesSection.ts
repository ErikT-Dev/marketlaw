import { rulesSectionHash } from "./rulesSectionHash";

export function openRulesSection(anchor: string): void {
  window.location.replace(rulesSectionHash(anchor));
}
