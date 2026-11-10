import type { EpochMs } from "../../shared/EpochMs";
import type { EmailSender } from "./EmailSender";
import { brevoSenderOf } from "./brevoSenderOf";
import { testOutboxSender } from "./testOutboxSender";

export function emailSenderOf(env: Env, now: EpochMs): EmailSender {
  return brevoSenderOf(env) ?? testOutboxSender(env, now);
}
