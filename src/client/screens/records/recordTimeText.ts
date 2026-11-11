export function recordTimeText(epochMs: number): string {
  return new Date(epochMs).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
}
