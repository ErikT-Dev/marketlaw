import type { MessageOutcome } from "./MessageOutcome";
import type { RoomRemoval } from "./RoomRemoval";

export type ReceiveOutcome =
  | { readonly isRoomGone: true }
  | ({ readonly isRoomGone: false; readonly removals: ReadonlyArray<RoomRemoval> } & Omit<
      MessageOutcome,
      "record" | "shouldSave"
    >);
