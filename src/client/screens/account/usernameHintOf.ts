import type { UsernameWait } from "../../../shared/api/UsernameWait";
import { dayAndMonthText } from "./dayAndMonthText";

export function usernameHintOf(wait: UsernameWait | null): string {
  return wait === null
    ? "You can change it 4 times in 7 days."
    : `You have changed it 4 times in 7 days. You can change it again on ${dayAndMonthText(wait.allowedAt)}.`;
}
