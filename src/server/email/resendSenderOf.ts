import type { EmailSender } from "./EmailSender";
import { resendKeysOf } from "./resendKeysOf";

const RESEND_EMAILS_URL = "https://api.resend.com/emails";

export function resendSenderOf(env: unknown): EmailSender | null {
  const keys = resendKeysOf(env);
  if (keys === null) {
    return null;
  }
  return {
    async send(email) {
      const reply = await fetch(RESEND_EMAILS_URL, {
        method: "POST",
        headers: { Authorization: `Bearer ${keys.apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          from: keys.from,
          to: email.to,
          subject: email.subject,
          text: email.text,
        }),
      }).catch(() => null);
      if (reply === null) {
        console.error("Sending an email failed: Resend could not be reached");
        return "failed";
      }
      if (!reply.ok) {
        console.error("Sending an email failed: Resend answered", reply.status);
        return "failed";
      }
      return "sent";
    },
  };
}
