import { isRecord } from "../harness-check/isRecord.ts";
import type { Scenario } from "./Scenario.ts";

function keysWithin(value: unknown): ReadonlyArray<string> {
  const items: ReadonlyArray<unknown> = Array.isArray(value) ? value : [value];
  return items.flatMap((item) => (isRecord(item) ? Object.keys(item) : []));
}

export function unhandledNestedFields(
  scenario: Scenario,
  nestedFields: ReadonlyMap<string, ReadonlySet<string>>,
): ReadonlyArray<string> {
  const parts = { given: scenario.given, then: scenario.then };
  return [...nestedFields.entries()].flatMap(([path, handled]) => {
    const [part, field] = path.split(".");
    const container = part === "given" || part === "then" ? parts[part] : {};
    const keys = keysWithin(container[field ?? ""]);
    return [...new Set(keys)]
      .filter((key) => !handled.has(key))
      .map((key) => `${part ?? ""} ${field ?? ""}.${key}`);
  });
}
