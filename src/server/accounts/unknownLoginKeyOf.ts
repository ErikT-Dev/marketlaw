import { loginLookupOf } from "./loginLookupOf";

export function unknownLoginKeyOf(login: string): string {
  const lookup = loginLookupOf(login);
  return `${lookup.by}:${lookup.key}`;
}
