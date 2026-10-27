import type { MessageInput } from "./MessageInput";

export type ReceiveInput = Omit<MessageInput, "record">;
