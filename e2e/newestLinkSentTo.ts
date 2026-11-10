import type { APIRequestContext } from "@playwright/test";
import * as v from "valibot";
import { TEST_ROOM_SECRET_HEADER } from "../src/shared/api/TEST_ROOM_SECRET_HEADER";
import { TestOutboxResponse } from "../src/shared/api/TestOutboxResponse";
import { readLocalTestRoomSecret } from "../tools/test-room/readLocalTestRoomSecret";

export async function newestLinkSentTo(
  request: APIRequestContext,
  to: string,
  fragment: string,
): Promise<string> {
  const response = await request.post("/api/test-outbox", {
    headers: { [TEST_ROOM_SECRET_HEADER]: readLocalTestRoomSecret() },
    data: { to },
  });
  const { emails } = v.parse(TestOutboxResponse, await response.json());
  const pattern = new RegExp(`/#${fragment}=[\\w-]+`);
  const link = emails.flatMap((email) => pattern.exec(email.text) ?? [])[0];
  if (link === undefined) {
    throw new Error(`no ${fragment} link was sent`);
  }
  return link;
}
