import { PROTOCOL_VERSION } from "../../shared/PROTOCOL_VERSION";
import type { ClientMessage } from "../../shared/protocol/ClientMessage";
import type { GuestLogOutIntent } from "./GuestLogOutIntent";

export function guestLogOutMessageOf(
  intent: GuestLogOutIntent,
  sent: { readonly token: string; readonly actionId: string },
): ClientMessage {
  switch (intent.type) {
    case "action":
      return {
        protocolVersion: PROTOCOL_VERSION,
        token: sent.token,
        ...intent,
        actionId: sent.actionId,
      };
    case "room":
      return { protocolVersion: PROTOCOL_VERSION, token: sent.token, ...intent };
  }
}
