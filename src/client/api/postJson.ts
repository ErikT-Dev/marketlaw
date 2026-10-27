export async function postJson(
  path: string,
  body: unknown,
  token: string | null,
): Promise<unknown> {
  const response = await fetch(path, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token === null ? {} : { Authorization: `Bearer ${token}` }),
    },
    body: JSON.stringify(body),
  });
  return response.json().catch(() => null);
}
