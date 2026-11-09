import { emailKeyOf } from "./emailKeyOf";
import type { LoginLookup } from "./LoginLookup";
import { nameKeyOf } from "./nameKeyOf";

export function loginLookupOf(login: string): LoginLookup {
  return login.includes("@")
    ? { by: "email", key: emailKeyOf(login) }
    : { by: "name", key: nameKeyOf(login) };
}
