import type { MessageOutcome } from "./MessageOutcome";

export type ReceiveOutcome =
  | { readonly isRoomGone: true }
  | ({ readonly isRoomGone: false } & Omit<MessageOutcome, "record" | "shouldSave">);
