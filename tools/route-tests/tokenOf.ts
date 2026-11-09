import type { RouteAnswer } from "./RouteAnswer.ts";

export function tokenOf(answer: RouteAnswer): string {
  const { token } = answer.body;
  if (typeof token !== "string") {
    throw new Error(`The answer has no token: ${String(answer.status)}`);
  }
  return token;
}
