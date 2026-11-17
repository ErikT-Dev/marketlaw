import * as v from "valibot";
import { CardName } from "../../../shared/catalogue/CardName";
import { CARD_SET_HASH } from "./CARD_SET_HASH";
import type { CardSetAddress } from "./CardSetAddress";

const CARD_PREFIX = `${CARD_SET_HASH}/`;

function decodedOrNull(encoded: string): string | null {
  try {
    return decodeURIComponent(encoded);
  } catch {
    return null;
  }
}

export function cardSetPageOf(hash: string): CardSetAddress | null {
  if (hash === CARD_SET_HASH) {
    return { openCard: null };
  }
  if (!hash.startsWith(CARD_PREFIX)) {
    return null;
  }
  const parsed = v.safeParse(CardName, decodedOrNull(hash.slice(CARD_PREFIX.length)));
  return { openCard: parsed.success ? parsed.output : null };
}
