import * as v from "valibot";
import { IconChangeResponse } from "../../shared/api/IconChangeResponse";
import type { IconChangeRequest } from "../../shared/api/IconChangeRequest";
import type { ReasonCode } from "../../shared/ReasonCode";
import { postJson } from "./postJson";

export async function requestIconChange(change: IconChangeRequest): Promise<ReasonCode | null> {
  const answer = await postJson("/api/icon-changes", change).catch(() => null);
  const parsed = v.safeParse(IconChangeResponse, answer);
  if (!parsed.success) {
    return "no_answer";
  }
  return parsed.output.isOk ? null : parsed.output.reason;
}
