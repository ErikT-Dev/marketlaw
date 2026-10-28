import type { ActionIntent } from "../../shared/protocol/ActionIntent";

export type PendingAction = {
  readonly id: string;
  readonly action: ActionIntent;
};
