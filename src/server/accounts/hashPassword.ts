import { PASSWORD_HASHING } from "./PASSWORD_HASHING";
import { pbkdf2Sha256Bytes } from "./pbkdf2Sha256Bytes";

function base64Of(bytes: Uint8Array): string {
  return btoa(String.fromCharCode(...bytes));
}

export async function hashPassword(
  password: string,
  salt: Uint8Array<ArrayBuffer> = crypto.getRandomValues(
    new Uint8Array(PASSWORD_HASHING.saltBytes),
  ),
): Promise<string> {
  const hash = await pbkdf2Sha256Bytes(password, salt, PASSWORD_HASHING.iterations);
  return [
    PASSWORD_HASHING.method,
    PASSWORD_HASHING.iterations,
    base64Of(salt),
    base64Of(hash),
  ].join("$");
}
