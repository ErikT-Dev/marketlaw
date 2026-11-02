import type { RoomRecord } from "./RoomRecord";

export async function encodeRoomRecord(record: RoomRecord): Promise<Uint8Array> {
  const compressed = new Blob([JSON.stringify(record)])
    .stream()
    .pipeThrough(new CompressionStream("deflate-raw"));
  return new Uint8Array(await new Response(compressed).arrayBuffer());
}
