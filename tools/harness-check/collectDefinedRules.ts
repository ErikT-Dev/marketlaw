const RULE_NUMBER_IN_BOLD = /^- \*\*([RMACT]\d+\.\d+)\*\*/gm;

export function collectDefinedRules(specText: string): ReadonlyArray<string> {
  return [...specText.matchAll(RULE_NUMBER_IN_BOLD)].map((match) => match[1] ?? "");
}
