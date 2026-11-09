import type { UsernameWait } from "../../../shared/api/UsernameWait";
import { dayAndMonthText } from "./dayAndMonthText";

export function usernameHintOf(wait: UsernameWait | null): string {
  return wait === null
    ? "You can change it once every 7 days."
    : `You changed it on ${dayAndMonthText(wait.changedAt)}. You can change it again on ${dayAndMonthText(wait.allowedAt)}.`;
}
