import type { TutorialAction } from "./TutorialAction";

function canonicalTextOf(value: unknown): string {
  if (Array.isArray(value)) {
    return `[${value.map(canonicalTextOf).join(",")}]`;
  }
  if (typeof value === "object" && value !== null) {
    const fields = Object.entries(value)
      .sort(([first], [second]) => first.localeCompare(second))
      .map(([key, field]) => `${JSON.stringify(key)}:${canonicalTextOf(field)}`);
    return `{${fields.join(",")}}`;
  }
  return JSON.stringify(value);
}

export function isStepAction(action: TutorialAction, accepted: TutorialAction): boolean {
  return canonicalTextOf(action) === canonicalTextOf(accepted);
}
