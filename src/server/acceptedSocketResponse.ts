export function acceptedSocketResponse(
  request: Request,
  accept: (server: WebSocket) => void,
): Response {
  if (request.headers.get("Upgrade") !== "websocket") {
    return new Response("Expected a WebSocket", { status: 426 });
  }
  const [client, server] = Object.values(new WebSocketPair());
  if (client === undefined || server === undefined) {
    return new Response("Could not open a WebSocket", { status: 500 });
  }
  accept(server);
  return new Response(null, { status: 101, webSocket: client });
}
