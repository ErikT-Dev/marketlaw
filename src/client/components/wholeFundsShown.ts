import { TENTHS_PER_FUND } from "../../shared/TENTHS_PER_FUND";

export function wholeFundsShown(tenths: number): string {
  return String(Math.floor(tenths / TENTHS_PER_FUND));
}
