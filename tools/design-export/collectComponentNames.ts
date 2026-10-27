import { isRecord } from "../harness-check/isRecord.ts";

export function collectComponentNames(
  data: Readonly<Record<string, unknown>>,
  names: Map<string, string>,
): void {
  const components = data["components"];
  if (!isRecord(components)) {
    return;
  }
  for (const [id, component] of Object.entries(components)) {
    if (isRecord(component)) {
      names.set(id, componentLabel(component));
    }
  }
}

function componentLabel(component: Readonly<Record<string, unknown>>): string {
  const properties = component["variantProperties"];
  const variant = Array.isArray(properties)
    ? properties
        .filter(isRecord)
        .map((property) => `${String(property["name"])}=${String(property["value"])}`)
        .join(", ")
    : "";
  const deleted = component["deleted"] === true ? " DELETED" : "";
  return `${String(component["name"])}${variant === "" ? "" : ` (${variant})`}${deleted}`;
}
