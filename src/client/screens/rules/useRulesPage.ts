import { useMemo, useSyncExternalStore } from "react";
import { subscribeToHash } from "../../components/subscribeToHash";
import type { RulesPageAddress } from "./RulesPageAddress";
import { rulesPageOf } from "./rulesPageOf";

function currentHash(): string {
  return window.location.hash;
}

export function useRulesPage(): RulesPageAddress | null {
  const hash = useSyncExternalStore(subscribeToHash, currentHash);
  return useMemo(() => rulesPageOf(hash), [hash]);
}
