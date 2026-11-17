import type { ReasonCode } from "../ReasonCode";

export type LobbyRejectedMessage = {
  readonly type: "lobby_rejected";
  readonly protocolVersion: number;
  readonly code: ReasonCode;
};
