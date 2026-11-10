import type { EmailSender } from "./EmailSender";
import { brevoKeysOf } from "./brevoKeysOf";

const BREVO_EMAILS_URL = "https://api.brevo.com/v3/smtp/email";
const SENDER_NAME = "MarketLaw";

export function brevoSenderOf(env: unknown): EmailSender | null {
  const keys = brevoKeysOf(env);
  if (keys === null) {
    return null;
  }
  return {
    async send(email) {
      const reply = await fetch(BREVO_EMAILS_URL, {
        method: "POST",
        headers: {
          "api-key": keys.apiKey,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          sender: { name: SENDER_NAME, email: keys.from },
          to: [{ email: email.to }],
          subject: email.subject,
          textContent: email.text,
        }),
      }).catch(() => null);
      if (reply === null) {
        console.error("Sending an email failed: Brevo could not be reached");
        return "failed";
      }
      if (!reply.ok) {
        console.error("Sending an email failed: Brevo answered", reply.status);
        return "failed";
      }
      return "sent";
    },
  };
}
