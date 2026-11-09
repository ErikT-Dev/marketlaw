import { useState } from "react";
import type { LoginRequest } from "../../../shared/api/LoginRequest";
import type { ReasonCode } from "../../../shared/ReasonCode";
import type { LoginAttempts } from "./LoginAttempts";

export function useLoginAttempts(
  onSubmit: (login: LoginRequest) => Promise<ReasonCode | null>,
): LoginAttempts {
  const [problem, setProblem] = useState<ReasonCode | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [humanCheckAttempt, setHumanCheckAttempt] = useState<number | null>(null);
  const [humanCheck, setHumanCheck] = useState("");
  const isCheckNeeded = humanCheckAttempt !== null;
  async function submit(login: string, password: string) {
    setIsSending(true);
    const check = isCheckNeeded ? { humanCheck } : {};
    const answer = await onSubmit({ login: login.trim(), password, ...check });
    setIsSending(false);
    if (answer === null) {
      return;
    }
    setProblem(answer === "human_check_failed" && !isCheckNeeded ? null : answer);
    if (isCheckNeeded || answer === "human_check_failed") {
      setHumanCheckAttempt((humanCheckAttempt ?? 0) + 1);
    }
  }
  return {
    problem,
    isSending,
    humanCheckAttempt,
    isWaitingForHumanCheck: isCheckNeeded && humanCheck === "",
    setHumanCheck,
    submit,
  };
}
