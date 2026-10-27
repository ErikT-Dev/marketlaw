export function coversOf(scenario: Readonly<Record<string, unknown>>): ReadonlyArray<string> {
  const covers = scenario["covers"];
  return Array.isArray(covers)
    ? covers.filter((rule): rule is string => typeof rule === "string")
    : [];
}
