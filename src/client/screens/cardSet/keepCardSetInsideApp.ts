import { CARD_SET_HASH } from "./CARD_SET_HASH";

export function keepCardSetInsideApp(): void {
  if (window.location.hash !== CARD_SET_HASH) {
    return;
  }
  window.history.replaceState(null, "", window.location.pathname);
  window.history.pushState(null, "", `${window.location.pathname}${CARD_SET_HASH}`);
}
