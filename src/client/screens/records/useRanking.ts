import { useEffect, useState } from "react";
import type { RankingPage } from "../../../shared/api/RankingPage";
import type { RankingResponse } from "../../../shared/api/RankingResponse";
import { requestRanking } from "../../api/requestRanking";

export function useRanking(token: string | null) {
  const [requested, setRequested] = useState<RankingPage>(1);
  const [ranking, setRanking] = useState<RankingResponse | null>(null);
  const [isFailed, setIsFailed] = useState(false);
  useEffect(() => {
    const stopped = new AbortController();
    void (async () => {
      const answer = await requestRanking(token, requested);
      if (stopped.signal.aborted) {
        return;
      }
      setIsFailed(answer === null);
      if (answer !== null) {
        setRanking(answer);
      }
    })();
    return () => {
      stopped.abort();
    };
  }, [token, requested]);
  return { ranking, isFailed, showPage: setRequested };
}
