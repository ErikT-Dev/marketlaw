import type { OutgoingEmail } from "./OutgoingEmail";

export type EmailSender = {
  readonly send: (email: OutgoingEmail) => Promise<"sent" | "failed">;
};
