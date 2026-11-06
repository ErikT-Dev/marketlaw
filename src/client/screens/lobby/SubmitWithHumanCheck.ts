import type { RefObject } from "react";
import type { ReasonCode } from "../../../shared/ReasonCode";
import type { IconText } from "../../components/IconText";

export type SubmitWithHumanCheck = {
  readonly containerRef: RefObject<HTMLDivElement | null>;
  readonly humanCheckToken: string;
  readonly isUnavailable: boolean;
  readonly error: IconText | null;
  readonly isSending: boolean;
  readonly submit: (send: (token: string) => Promise<ReasonCode | null>) => Promise<void>;
};
