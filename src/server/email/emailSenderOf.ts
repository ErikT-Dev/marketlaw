import type { EpochMs } from "../../shared/EpochMs";
import type { EmailSender } from "./EmailSender";
import { resendSenderOf } from "./resendSenderOf";
import { testOutboxSender } from "./testOutboxSender";

export function emailSenderOf(env: Env, now: EpochMs): EmailSender {
  return resendSenderOf(env) ?? testOutboxSender(env, now);
}
