import * as v from "valibot";
import type { TestHarness } from "wrangler";
import { TEST_ROOM_SECRET_HEADER } from "../../src/shared/api/TEST_ROOM_SECRET_HEADER.ts";
import { TestOutboxResponse } from "../../src/shared/api/TestOutboxResponse.ts";
import { ROUTE_TEST_ROOM_SECRET } from "./ROUTE_TEST_ROOM_SECRET.ts";

export async function readTestOutbox(server: TestHarness, to: string): Promise<TestOutboxResponse> {
  const response = await server.fetch("http://localhost/api/test-outbox", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      [TEST_ROOM_SECRET_HEADER]: ROUTE_TEST_ROOM_SECRET,
    },
    body: JSON.stringify({ to }),
  });
  return v.parse(TestOutboxResponse, await response.json());
}
