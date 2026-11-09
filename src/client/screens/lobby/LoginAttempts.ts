import type { ReasonCode } from "../../../shared/ReasonCode";

export type LoginAttempts = {
  readonly problem: ReasonCode | null;
  readonly isSending: boolean;
  readonly humanCheckAttempt: number | null;
  readonly isWaitingForHumanCheck: boolean;
  readonly setHumanCheck: (token: string) => void;
  readonly submit: (login: string, password: string) => Promise<void>;
};
