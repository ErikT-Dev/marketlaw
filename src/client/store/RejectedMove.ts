import type { ActionIntent } from "../../shared/protocol/ActionIntent";
import type { ReasonCode } from "../../shared/ReasonCode";

export type RejectedMove = {
  readonly action: ActionIntent | null;
  readonly code: ReasonCode;
};
