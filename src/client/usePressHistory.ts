import { useEffect, useState } from "react";
import type { RecentPress } from "../shared/RecentPress";
import { parsePressHistory } from "../shared/parsePressHistory";

const HISTORY_URL = "/api/history";

export function usePressHistory(pressCount: number | null): ReadonlyArray<RecentPress> {
  const [recentPresses, setRecentPresses] = useState<ReadonlyArray<RecentPress>>([]);

  useEffect(() => {
    if (pressCount === null) {
      return;
    }
    const abortController = new AbortController();
    async function refreshRecentPresses(): Promise<void> {
      const presses = await loadRecentPresses(abortController.signal);
      if (presses !== null) {
        setRecentPresses(presses);
      }
    }
    void refreshRecentPresses();
    return () => {
      abortController.abort();
    };
  }, [pressCount]);

  return recentPresses;
}

async function loadRecentPresses(signal: AbortSignal): Promise<ReadonlyArray<RecentPress> | null> {
  try {
    const response = await fetch(HISTORY_URL, { signal });
    return response.ok ? (parsePressHistory(await response.text())?.recentPresses ?? null) : null;
  } catch {
    return null;
  }
}
