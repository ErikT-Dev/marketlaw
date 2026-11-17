import { RULEBOOK_LIST_ITEM } from "./RULEBOOK_LIST_ITEM";

export function isRulebookListStart(line: string): boolean {
  return RULEBOOK_LIST_ITEM.ordered.test(line) || RULEBOOK_LIST_ITEM.unordered.test(line);
}
