import type { ReasonCode } from "../../../shared/ReasonCode";

export type EmailRequest = {
  readonly isSending: boolean;
  readonly isDone: boolean;
  readonly problem: ReasonCode | null;
  readonly send: (request: () => Promise<ReasonCode | null>) => Promise<void>;
};
