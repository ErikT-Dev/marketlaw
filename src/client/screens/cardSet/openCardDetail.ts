import type { CardName } from "../../../shared/catalogue/CardName";
import { cardDetailHash } from "./cardDetailHash";

export function openCardDetail(name: CardName): void {
  window.location.assign(cardDetailHash(name));
}
