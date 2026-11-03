import { RESERVED_USERNAME } from "./RESERVED_USERNAME";
import { nameKeyOf } from "./nameKeyOf";

const USERNAME_PATTERN = /^[A-Za-z0-9_-](?:[A-Za-z0-9_-]| (?! ))*[A-Za-z0-9_-]$/;
const SHORTEST = 3;
const LONGEST = 20;

export function usernameProblem(name: string): "username_invalid" | "username_reserved" | null {
  const isValid = name.length >= SHORTEST && name.length <= LONGEST && USERNAME_PATTERN.test(name);
  if (!isValid) {
    return "username_invalid";
  }
  return nameKeyOf(name) === nameKeyOf(RESERVED_USERNAME) ? "username_reserved" : null;
}
