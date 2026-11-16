export function openSocketsOf(ctx: DurableObjectState): ReadonlyArray<WebSocket> {
  return ctx.getWebSockets().filter((socket) => socket.readyState === WebSocket.OPEN);
}
