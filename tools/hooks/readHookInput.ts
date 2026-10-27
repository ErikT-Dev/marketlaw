import { isRecord } from "../harness-check/isRecord.ts";

export async function readHookInput(): Promise<Readonly<Record<string, unknown>>> {
  const chunks: Array<Buffer> = [];
  for await (const chunk of process.stdin) {
    const piece: unknown = chunk;
    if (Buffer.isBuffer(piece)) {
      chunks.push(piece);
    }
  }
  const parsed: unknown = JSON.parse(Buffer.concat(chunks).toString("utf8"));
  return isRecord(parsed) ? parsed : {};
}
