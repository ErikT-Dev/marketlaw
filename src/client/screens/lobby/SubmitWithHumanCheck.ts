import type { RefObject } from "react";
import type { ReasonCode } from "../../../shared/ReasonCode";

export type SubmitWithHumanCheck = {
  readonly containerRef: RefObject<HTMLDivElement | null>;
  readonly humanCheckToken: string;
  readonly isUnavailable: boolean;
  readonly error: string | null;
  readonly isSending: boolean;
  readonly submit: (send: (token: string) => Promise<ReasonCode | null>) => Promise<void>;
};
