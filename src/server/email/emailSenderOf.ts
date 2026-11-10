import type { EpochMs } from "../../shared/EpochMs";
import type { EmailSender } from "./EmailSender";
import { testOutboxSender } from "./testOutboxSender";

export function emailSenderOf(env: Env, now: EpochMs): EmailSender {
  return testOutboxSender(env, now);
}
