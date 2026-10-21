export function parseJsonObject(raw: string): Readonly<Record<string, unknown>> | null {
  try {
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed === "object" && parsed !== null && !Array.isArray(parsed)) {
      return Object.fromEntries(Object.entries(parsed));
    }
    return null;
  } catch {
    return null;
  }
}
