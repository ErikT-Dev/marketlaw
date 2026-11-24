import type { UsernameWait } from "../../../shared/api/UsernameWait";
import { recordTimeText } from "../records/recordTimeText";
import { dayAndMonthText } from "./dayAndMonthText";

export function iconHintOf(wait: UsernameWait | null): string {
  return wait === null
    ? "You can change it 10 times in 24 hours."
    : `You have changed it 10 times in 24 hours. You can change it again on ${dayAndMonthText(wait.allowedAt)} at ${recordTimeText(wait.allowedAt)}.`;
}
