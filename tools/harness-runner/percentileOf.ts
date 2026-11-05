export function percentileOf(values: ReadonlyArray<number>, fraction: number): number {
  const sorted = [...values].sort((first, second) => first - second);
  return sorted[Math.max(0, Math.ceil(sorted.length * fraction) - 1)] ?? 0;
}
