import type { EpochMs } from "../../shared/EpochMs";
import { isTestRoomSecretConfigured } from "../testRooms/isTestRoomSecretConfigured";
import type { EmailSender } from "./EmailSender";

export function testOutboxSender(env: Env, now: EpochMs): EmailSender {
  return {
    async send(email) {
      if (!isTestRoomSecretConfigured(env)) {
        return "failed";
      }
      await env.DB.prepare(
        "INSERT INTO test_outbox (sent_ms, to_address, subject, text) VALUES (?, ?, ?, ?)",
      )
        .bind(now, email.to, email.subject, email.text)
        .run();
      return "sent";
    },
  };
}
