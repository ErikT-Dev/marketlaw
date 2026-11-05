import { isRecord } from "../harness-check/isRecord.ts";
import type { BudgetEntry } from "./BudgetEntry.ts";

function textOf(value: unknown): string {
  return typeof value === "string" || typeof value === "number" ? String(value) : "";
}

export function readBudgetEntries(parsed: unknown): ReadonlyArray<BudgetEntry> {
  const entries: ReadonlyArray<unknown> = Array.isArray(parsed) ? parsed : [];
  return entries.flatMap((entry) =>
    isRecord(entry) && typeof entry["id"] === "string"
      ? [
          {
            id: entry["id"],
            name: textOf(entry["name"]),
            limit: textOf(entry["limit"]),
            unit: textOf(entry["unit"]),
          },
        ]
      : [],
  );
}
