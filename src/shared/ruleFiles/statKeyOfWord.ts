import { STAT_KEYS } from "../STAT_KEYS";
import type { Stats } from "../Stats";

export function statKeyOfWord(word: string): keyof Stats | null {
  if (word === "fund") {
    return "funds";
  }
  return STAT_KEYS.find((key) => key === word) ?? null;
}
