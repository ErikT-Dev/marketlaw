import { useEffect, useState } from "react";
import type { GameId } from "../../../shared/GameId";
import { requestGameRecord } from "../../api/requestGameRecord";
import type { GameRecordState } from "./GameRecordState";

export function useGameRecord(gameId: GameId): GameRecordState {
  const [record, setRecord] = useState<GameRecordState>({ kind: "loading" });
  useEffect(() => {
    const stopped = new AbortController();
    void (async () => {
      const answer = await requestGameRecord(gameId);
      if (!stopped.signal.aborted) {
        setRecord(answer ?? { kind: "failed" });
      }
    })();
    return () => {
      stopped.abort();
    };
  }, [gameId]);
  return record;
}
