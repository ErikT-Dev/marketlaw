import type { CardName } from "../../../shared/catalogue/CardName";
import { CARD_SET_HASH } from "./CARD_SET_HASH";

export function cardDetailHash(name: CardName): string {
  return `${CARD_SET_HASH}/${encodeURIComponent(name)}`;
}
