import { CARD_SET_HASH } from "./CARD_SET_HASH";
import { cardDetailHash } from "./cardDetailHash";
import { cardSetPageOf } from "./cardSetPageOf";

export function keepCardSetInsideApp(): void {
  const { hash, pathname } = window.location;
  const address = cardSetPageOf(hash);
  if (address === null) {
    return;
  }
  window.history.replaceState(null, "", pathname);
  window.history.pushState(null, "", `${pathname}${CARD_SET_HASH}`);
  if (address.openCard !== null) {
    window.history.pushState(null, "", `${pathname}${cardDetailHash(address.openCard)}`);
  }
}
