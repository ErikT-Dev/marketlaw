import { readFileSync } from "node:fs";
import { parseRulebook } from "../../../src/client/screens/rules/parseRulebook.ts";
import type { Rulebook } from "../../../src/client/screens/rules/Rulebook.ts";
import { HARNESS_PATHS } from "../../harness-check/HARNESS_PATHS.ts";

export function readRulebook(): Rulebook {
  const result = parseRulebook(readFileSync(HARNESS_PATHS.rulebook, "utf8"));
  if (!result.isOk) {
    throw new Error(`the rulebook does not parse: ${result.error.join("; ")}`);
  }
  return result.value;
}
