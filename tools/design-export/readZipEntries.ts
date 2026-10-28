import { readFileSync } from "node:fs";
import { inflateRawSync } from "node:zlib";

const END_OF_DIRECTORY = 0x06054b50;
const DIRECTORY_ENTRY = 0x02014b50;
const STORED = 0;

function findEndOfDirectory(zip: Buffer): number {
  for (let offset = zip.length - 22; offset >= 0; offset -= 1) {
    if (zip.readUInt32LE(offset) === END_OF_DIRECTORY) {
      return offset;
    }
  }
  throw new Error("not a zip file");
}

function entryData(zip: Buffer, localOffset: number, method: number, size: number): Buffer {
  const nameLength = zip.readUInt16LE(localOffset + 26);
  const extraLength = zip.readUInt16LE(localOffset + 28);
  const start = localOffset + 30 + nameLength + extraLength;
  const packed = zip.subarray(start, start + size);
  return method === STORED ? packed : inflateRawSync(packed);
}

export function readZipEntries(path: string): ReadonlyMap<string, () => Buffer> {
  const zip = readFileSync(path);
  const end = findEndOfDirectory(zip);
  const count = zip.readUInt16LE(end + 10);
  const entries = new Map<string, () => Buffer>();
  let offset = zip.readUInt32LE(end + 16);
  for (let index = 0; index < count; index += 1) {
    if (zip.readUInt32LE(offset) !== DIRECTORY_ENTRY) {
      throw new Error("broken zip directory");
    }
    const method = zip.readUInt16LE(offset + 10);
    const size = zip.readUInt32LE(offset + 20);
    const nameLength = zip.readUInt16LE(offset + 28);
    const extraLength = zip.readUInt16LE(offset + 30);
    const commentLength = zip.readUInt16LE(offset + 32);
    const localOffset = zip.readUInt32LE(offset + 42);
    const name = zip.toString("utf8", offset + 46, offset + 46 + nameLength);
    entries.set(name, () => entryData(zip, localOffset, method, size));
    offset += 46 + nameLength + extraLength + commentLength;
  }
  return entries;
}
