import { useState } from "react";
import type { ReasonCode } from "../../../shared/ReasonCode";
import type { EmailRequest } from "./EmailRequest";

export function useEmailRequest(): EmailRequest {
  const [isSending, setIsSending] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [problem, setProblem] = useState<ReasonCode | null>(null);
  async function send(request: () => Promise<ReasonCode | null>) {
    setIsSending(true);
    const answer = await request();
    setIsSending(false);
    setProblem(answer);
    setIsDone(answer === null);
  }
  return { isSending, isDone, problem, send };
}
