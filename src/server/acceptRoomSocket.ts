import { acceptedSocketResponse } from "./acceptedSocketResponse";
import { NO_CONNECTION } from "./NO_CONNECTION";

export function acceptRoomSocket(ctx: DurableObjectState, request: Request): Response {
  return acceptedSocketResponse(request, (server) => {
    ctx.acceptWebSocket(server);
    server.serializeAttachment(NO_CONNECTION);
  });
}
