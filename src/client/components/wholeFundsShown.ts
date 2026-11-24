const TENTHS_PER_FUND = 10;

export function wholeFundsShown(tenths: number): string {
  return String(Math.floor(tenths / TENTHS_PER_FUND));
}
