import type { EmailResponse } from "../../shared/api/EmailResponse";
import { EmailLinkRequest } from "../../shared/api/EmailLinkRequest";
import { confirmEmailWithLink } from "../email/confirmEmailWithLink";
import { nowMs } from "../nowMs";
import { sha256Hex } from "../sha256Hex";
import { bodyOf } from "./bodyOf";

function json(body: EmailResponse, status: number): Response {
  return Response.json(body, { status });
}

export async function confirmEmailRoute(request: Request, env: Env): Promise<Response> {
  const body = await bodyOf(request, EmailLinkRequest);
  if (body === null) {
    return json({ isOk: false, reason: "malformed_message" }, 400);
  }
  const link = { tokenHash: await sha256Hex(body.link), now: nowMs() };
  return (await confirmEmailWithLink(env.DB, link))
    ? json({ isOk: true }, 200)
    : json({ isOk: false, reason: "link_expired" }, 400);
}
