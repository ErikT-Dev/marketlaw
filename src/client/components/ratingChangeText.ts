export function ratingChangeText(change: number): string {
  if (change > 0) {
    return `+${String(change)}`;
  }
  return change < 0 ? `−${String(-change)}` : "0";
}
