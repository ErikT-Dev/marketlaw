const TENTHS_PER_FUND = 10;

export function tenthsShown(tenths: number): string {
  return (tenths / TENTHS_PER_FUND).toFixed(1);
}
