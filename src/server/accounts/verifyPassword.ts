import { DUMMY_PASSWORD_HASH } from "./DUMMY_PASSWORD_HASH";
import { PASSWORD_HASHING } from "./PASSWORD_HASHING";
import { pbkdf2Sha256Bytes } from "./pbkdf2Sha256Bytes";

const STORED_HASH_PATTERN = /^pbkdf2-sha256\$([1-9]\d{0,6})\$([A-Za-z0-9+/=]+)\$([A-Za-z0-9+/=]+)$/;
const HIGHEST_ITERATIONS = 100_000;

function bytesOfBase64(text: string): Uint8Array<ArrayBuffer> {
  return Uint8Array.from(atob(text), (character) => character.charCodeAt(0));
}

function isSameInConstantTime(left: Uint8Array, right: Uint8Array): boolean {
  let difference = left.length ^ right.length;
  for (let index = 0; index < left.length; index += 1) {
    difference |= (left[index] ?? 0) ^ (right[index] ?? 0);
  }
  return difference === 0;
}

export async function verifyPassword(
  password: string,
  storedHash: string | null,
): Promise<boolean> {
  const isKnownAccount = storedHash !== null;
  const parts = STORED_HASH_PATTERN.exec(storedHash ?? DUMMY_PASSWORD_HASH);
  const iterations = Number(parts?.[1] ?? PASSWORD_HASHING.iterations);
  if (parts === null || iterations > HIGHEST_ITERATIONS) {
    throw new Error("A stored password hash is not in the expected format");
  }
  const expected = bytesOfBase64(parts[3] ?? "");
  const actual = await pbkdf2Sha256Bytes(password, bytesOfBase64(parts[2] ?? ""), iterations);
  return isSameInConstantTime(actual, expected) && isKnownAccount;
}
