import { useMemo, useSyncExternalStore } from "react";
import { subscribeToHash } from "../../components/subscribeToHash";
import type { CardSetAddress } from "./CardSetAddress";
import { cardSetPageOf } from "./cardSetPageOf";

function currentHash(): string {
  return window.location.hash;
}

export function useCardSetPage(): CardSetAddress | null {
  const hash = useSyncExternalStore(subscribeToHash, currentHash);
  return useMemo(() => cardSetPageOf(hash), [hash]);
}
