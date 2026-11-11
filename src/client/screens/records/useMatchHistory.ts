import { useEffect, useState } from "react";
import type { PlayerId } from "../../../shared/PlayerId";
import { requestMatchHistory } from "../../api/requestMatchHistory";
import { matchHistoryAfterOlder } from "./matchHistoryAfterOlder";
import type { MatchHistoryState } from "./MatchHistoryState";
import { matchHistoryStateOf } from "./matchHistoryStateOf";

export function useMatchHistory(playerId: PlayerId) {
  const [history, setHistory] = useState<MatchHistoryState>({ kind: "loading" });
  useEffect(() => {
    const stopped = new AbortController();
    void (async () => {
      const answer = await requestMatchHistory(playerId, null);
      if (!stopped.signal.aborted) {
        setHistory(matchHistoryStateOf(answer));
      }
    })();
    return () => {
      stopped.abort();
    };
  }, [playerId]);
  async function showOlderGames(): Promise<void> {
    if (history.kind !== "found" || history.older === null) {
      return;
    }
    setHistory({ ...history, olderGames: "loading" });
    const answer = await requestMatchHistory(playerId, history.older);
    setHistory((shown) => matchHistoryAfterOlder(shown, answer));
  }
  return { history, showOlderGames };
}
