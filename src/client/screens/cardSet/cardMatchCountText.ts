export function cardMatchCountText(count: number): string {
  return count === 1 ? "1 card matches" : `${String(count)} cards match`;
}
