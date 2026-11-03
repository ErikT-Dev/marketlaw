import type { HostEvent } from "./HostEvent";
import type { ActionIntent } from "./protocol/ActionIntent";
import type { RoomIntent } from "./protocol/RoomIntent";

export type GameHost = {
  readonly sendAction: (action: ActionIntent) => string | null;
  readonly sendRoomAction: (action: RoomIntent) => boolean;
  readonly requestResync: () => void;
  readonly subscribe: (listener: (event: HostEvent) => void) => () => void;
  readonly close: () => void;
};
