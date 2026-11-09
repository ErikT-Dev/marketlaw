import { firstFreeName } from "../../../src/server/accounts/firstFreeName.ts";
import { generatedNames } from "../../../src/server/accounts/generatedNames.ts";
import type { ScriptedRandom } from "../ScriptedRandom.ts";

const GENERATED_CANDIDATES = 10;
const NAME_STEP = 7;

export function scriptedGeneratedName(
  random: ScriptedRandom,
  takenKeys: ReadonlyArray<string>,
  namesAskedBefore: number,
): { readonly name: string | null; readonly namesAsked: number } {
  let namesAsked = namesAskedBefore;
  function nextNameIndex(limit: number): number {
    namesAsked += 1;
    return (namesAsked * NAME_STEP) % limit;
  }
  const draw = random.next("generated_name", "setup");
  const candidates =
    draw.kind === "listed" && typeof draw.value === "string"
      ? [draw.value]
      : generatedNames(nextNameIndex, GENERATED_CANDIDATES);
  return { name: firstFreeName(candidates, takenKeys), namesAsked };
}
