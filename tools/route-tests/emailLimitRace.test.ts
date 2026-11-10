import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type { TestHarness } from "wrangler";
import { postToRoute } from "./postToRoute.ts";
import { readTestOutbox } from "./readTestOutbox.ts";
import { startRouteTestServer } from "./startRouteTestServer.ts";
import { tokenOf } from "./tokenOf.ts";

const DUMMY_HUMAN_CHECK = "XXXX.DUMMY.TOKEN.XXXX";
const STARTING_MS = 30_000;
const PARALLEL_REQUESTS = 5;

let server: TestHarness;

beforeAll(async () => {
  server = await startRouteTestServer();
}, STARTING_MS);

afterAll(async () => {
  await server.close();
});

describe("the email limits under parallel requests", () => {
  it(
    "sends exactly 3 emails a day to an account when Send it again is pressed 5 times at once",
    async () => {
      const email = "parallel.sender@example.com";
      const signup = await postToRoute(server, "/api/signups", {
        username: "Parallelsender",
        email,
        password: "racing-tides-58",
        humanCheck: DUMMY_HUMAN_CHECK,
      });
      const token = tokenOf(signup);
      const answers = await Promise.all(
        Array.from({ length: PARALLEL_REQUESTS }, async () =>
          postToRoute(server, "/api/confirmation-emails", { token }),
        ),
      );
      const statuses = answers.map(({ status }) => status).sort((first, second) => first - second);
      expect(statuses).toEqual([200, 200, 429, 429, 429]);
      expect((await readTestOutbox(server, email)).emails).toHaveLength(3);
    },
    STARTING_MS,
  );
});
