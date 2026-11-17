import * as v from "valibot";
import { ReasonCode } from "../ReasonCode";
import { LobbyMessage } from "./LobbyMessage";

export const LOBBY_SERVER_MESSAGE_SCHEMA = v.variant("type", [
  LobbyMessage,
  v.object({
    type: v.literal("lobby_rejected"),
    protocolVersion: v.number(),
    code: ReasonCode,
  }),
]);
