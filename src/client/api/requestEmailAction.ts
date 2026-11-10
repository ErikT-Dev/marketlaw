import * as v from "valibot";
import { EmailResponse } from "../../shared/api/EmailResponse";
import type { ReasonCode } from "../../shared/ReasonCode";
import { postJson } from "./postJson";

export async function requestEmailAction(path: string, body: unknown): Promise<ReasonCode | null> {
  const parsed = v.safeParse(EmailResponse, await postJson(path, body).catch(() => null));
  if (!parsed.success) {
    return "no_answer";
  }
  return parsed.output.isOk ? null : parsed.output.reason;
}
