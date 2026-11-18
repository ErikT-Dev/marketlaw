import type { HostEvent } from "./HostEvent";
import type { ActionIntent } from "./protocol/ActionIntent";
import type { RoomIntent } from "./protocol/RoomIntent";
import type { TutorialIntent } from "./protocol/TutorialIntent";

export type GameHost = {
  readonly sendAction: (action: ActionIntent) => string | null;
  readonly sendRoomAction: (action: RoomIntent) => boolean;
  readonly sendTutorialAction: (action: TutorialIntent) => string | null;
  readonly requestResync: () => void;
  readonly subscribe: (listener: (event: HostEvent) => void) => () => void;
  readonly close: () => void;
};
