import { DESIGN_EXPORT_PATHS } from "./DESIGN_EXPORT_PATHS.ts";

export async function callPenpot(
  command: string,
  body: Readonly<Record<string, unknown>>,
  token: string,
): Promise<Response> {
  const response = await fetch(`${DESIGN_EXPORT_PATHS.penpotUrl}/api/rpc/command/${command}`, {
    method: "POST",
    headers: {
      Authorization: `Token ${token}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    throw new Error(`Penpot ${command} failed with HTTP ${response.status}`);
  }
  return response;
}
