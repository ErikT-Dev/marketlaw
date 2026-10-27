import type { HostEvent } from "./HostEvent";
import type { ActionIntent } from "./protocol/ActionIntent";

export type GameHost = {
  readonly sendAction: (action: ActionIntent) => string;
  readonly requestResync: () => void;
  readonly subscribe: (listener: (event: HostEvent) => void) => () => void;
  readonly close: () => void;
};
