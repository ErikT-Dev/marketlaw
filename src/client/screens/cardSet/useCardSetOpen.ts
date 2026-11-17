import { useSyncExternalStore } from "react";
import { subscribeToHash } from "../../components/subscribeToHash";
import { CARD_SET_HASH } from "./CARD_SET_HASH";

function isCardSetHash(): boolean {
  return window.location.hash === CARD_SET_HASH;
}

export function useCardSetOpen(): boolean {
  return useSyncExternalStore(subscribeToHash, isCardSetHash);
}
