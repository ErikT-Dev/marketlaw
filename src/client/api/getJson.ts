export async function getJson(path: string): Promise<unknown> {
  const response = await fetch(path).catch(() => null);
  return response === null ? null : response.json().catch(() => null);
}
