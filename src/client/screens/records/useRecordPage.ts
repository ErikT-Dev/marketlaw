import { useMemo, useSyncExternalStore } from "react";
import { subscribeToHash } from "../../components/subscribeToHash";
import type { RecordPage } from "./RecordPage";
import { recordPageOf } from "./recordPageOf";

function currentHash(): string {
  return window.location.hash;
}

export function useRecordPage(): RecordPage | null {
  const hash = useSyncExternalStore(subscribeToHash, currentHash);
  return useMemo(() => recordPageOf(hash), [hash]);
}
