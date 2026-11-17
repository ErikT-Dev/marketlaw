import rulebookText from "../../../../harness/spec/rulebook.md?raw";
import { parseRulebook } from "./parseRulebook";
import type { Rulebook } from "./Rulebook";

function parsedRulebook(): Rulebook {
  const result = parseRulebook(rulebookText);
  if (!result.isOk) {
    throw new Error(`The rulebook could not be read: ${result.error.join("; ")}`);
  }
  return result.value;
}

export const PARSED_RULEBOOK: Rulebook = parsedRulebook();
