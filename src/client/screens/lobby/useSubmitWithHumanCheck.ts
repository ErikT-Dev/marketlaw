import { useState, type RefObject } from "react";
import type { ReasonCode } from "../../../shared/ReasonCode";
import { REJECTION_MESSAGES } from "../game/REJECTION_MESSAGES";
import { useHumanCheck } from "./useHumanCheck";

export type SubmitWithHumanCheck = {
  readonly containerRef: RefObject<HTMLDivElement | null>;
  readonly humanCheckToken: string;
  readonly isUnavailable: boolean;
  readonly error: string | null;
  readonly isSending: boolean;
  readonly submit: (send: (token: string) => Promise<ReasonCode | null>) => Promise<void>;
};

export function useSubmitWithHumanCheck(): SubmitWithHumanCheck {
  const [attempt, setAttempt] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const { containerRef, token, isUnavailable } = useHumanCheck(attempt);
  async function submit(send: (humanCheck: string) => Promise<ReasonCode | null>) {
    setIsSending(true);
    const problem = await send(token);
    setIsSending(false);
    if (problem !== null) {
      setError(REJECTION_MESSAGES[problem]);
      setAttempt((previous) => previous + 1);
    }
  }
  return { containerRef, humanCheckToken: token, isUnavailable, error, isSending, submit };
}
