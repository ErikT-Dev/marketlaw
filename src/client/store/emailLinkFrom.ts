import * as v from "valibot";
import { SessionToken } from "../../shared/api/SessionToken";
import type { EmailLink } from "./EmailLink";

const LINK_FIELDS = v.union([
  v.strictObject({ confirm: SessionToken }),
  v.strictObject({ reset: SessionToken }),
  v.strictObject({ "forgot-password": v.literal("") }),
]);

export function emailLinkFrom(hash: string): EmailLink | null {
  const fields = Object.fromEntries(new URLSearchParams(hash.replace(/^#/, "")));
  const parsed = v.safeParse(LINK_FIELDS, fields);
  if (!parsed.success) {
    return null;
  }
  const link = parsed.output;
  if ("confirm" in link) {
    return { kind: "confirm", link: link.confirm };
  }
  return "reset" in link ? { kind: "reset", link: link.reset } : { kind: "forgot_password" };
}
