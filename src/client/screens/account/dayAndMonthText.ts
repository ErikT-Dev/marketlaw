export function dayAndMonthText(epochMs: number): string {
  return new Date(epochMs).toLocaleDateString("en-GB", { day: "numeric", month: "long" });
}
