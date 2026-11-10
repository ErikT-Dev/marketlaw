import { emailKeyOf } from "../accounts/emailKeyOf";
import { sha256Hex } from "../sha256Hex";

export async function addressCountKeyOf(address: string): Promise<string> {
  return `address:${await sha256Hex(emailKeyOf(address))}`;
}
