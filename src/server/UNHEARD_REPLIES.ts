import type { ReplySocket } from "./ReplySocket";

export const UNHEARD_REPLIES: ReplySocket = {
  send: () => undefined,
  serializeAttachment: () => undefined,
  close: () => undefined,
};
