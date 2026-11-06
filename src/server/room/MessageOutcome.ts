import type { PlayerId } from "../../shared/PlayerId";
import type { ServerMessage } from "../../shared/protocol/ServerMessage";
import type { AddressedNotice } from "./AddressedNotice";
import type { ChatMessage } from "./ChatMessage";
import type { ConnectionState } from "./ConnectionState";
import type { RoomRecord } from "./RoomRecord";
import type { RoomRemoval } from "./RoomRemoval";

export type MessageOutcome = {
  readonly record: RoomRecord | null;
  readonly connection: ConnectionState;
  readonly shouldSave: boolean;
  readonly reply: ServerMessage;
  readonly playersToUpdate: ReadonlyArray<PlayerId>;
  readonly shouldClose: boolean;
  readonly removals: ReadonlyArray<RoomRemoval>;
  readonly notices: ReadonlyArray<AddressedNotice>;
  readonly chatMessage: ChatMessage | null;
};
