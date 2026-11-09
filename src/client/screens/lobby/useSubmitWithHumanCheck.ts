import { useState } from "react";
import type { SubmitWithHumanCheck } from "./SubmitWithHumanCheck";
import type { ReasonCode } from "../../../shared/ReasonCode";
import { REJECTION_MESSAGES } from "../game/REJECTION_MESSAGES";
import { useHumanCheck } from "./useHumanCheck";

export function useSubmitWithHumanCheck(): SubmitWithHumanCheck {
  const [attempt, setAttempt] = useState(0);
  const [problem, setProblem] = useState<ReasonCode | null>(null);
  const [isSending, setIsSending] = useState(false);
  const { containerRef, token, isUnavailable } = useHumanCheck(attempt);
  async function submit(send: (humanCheck: string) => Promise<ReasonCode | null>) {
    setIsSending(true);
    const answer = await send(token);
    setIsSending(false);
    setProblem(answer);
    if (answer !== null) {
      setAttempt((previous) => previous + 1);
    }
  }
  const error = problem === null ? null : REJECTION_MESSAGES[problem];
  return { containerRef, humanCheckToken: token, isUnavailable, error, problem, isSending, submit };
}
