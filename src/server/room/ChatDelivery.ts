import type { PlayerId } from "../../shared/PlayerId";
import type { ServerMessage } from "../../shared/protocol/ServerMessage";

export type ChatDelivery = {
  readonly playerId: PlayerId;
  readonly message: Extract<ServerMessage, { readonly type: "chat" }>;
};
