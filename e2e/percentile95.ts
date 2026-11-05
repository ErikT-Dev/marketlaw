const PERCENTILE = 0.95;

export function percentile95(values: ReadonlyArray<number>): number {
  const sorted = [...values].sort((first, second) => first - second);
  return sorted[Math.max(0, Math.ceil(sorted.length * PERCENTILE) - 1)] ?? 0;
}
