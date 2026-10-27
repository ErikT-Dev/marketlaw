import { isRecord } from "../harness-check/isRecord.ts";
import type { IdentifiedEntry } from "./IdentifiedEntry.ts";

export function readIdentifiedEntries(parsed: unknown): ReadonlyArray<IdentifiedEntry> {
  const entries: ReadonlyArray<unknown> = Array.isArray(parsed) ? parsed : [];
  return entries.flatMap((entry) =>
    isRecord(entry) && typeof entry["id"] === "string"
      ? [{ id: entry["id"], name: typeof entry["name"] === "string" ? entry["name"] : "" }]
      : [],
  );
}
