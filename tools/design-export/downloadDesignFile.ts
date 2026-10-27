import { writeFileSync } from "node:fs";
import { callPenpot } from "./callPenpot.ts";

export async function downloadDesignFile(
  fileId: string,
  target: string,
  token: string,
): Promise<void> {
  const response = await callPenpot(
    "export-binfile",
    { fileId, includeLibraries: false, embedAssets: false, version: 3 },
    token,
  );
  const events = await response.text();
  const uri = /"~#uri":"([^"]+)"/.exec(events)?.[1];
  if (uri === undefined) {
    throw new Error(`Penpot did not return a download link for file ${fileId}`);
  }
  const download = await fetch(uri, { headers: { Authorization: `Token ${token}` } });
  if (!download.ok) {
    throw new Error(`Downloading file ${fileId} failed with HTTP ${download.status}`);
  }
  writeFileSync(target, Buffer.from(await download.arrayBuffer()));
}
