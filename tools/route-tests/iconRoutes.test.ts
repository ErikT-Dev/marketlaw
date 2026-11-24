import * as v from "valibot";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type { TestHarness } from "wrangler";
import { AccountResponse } from "../../src/shared/api/AccountResponse.ts";
import { postToRoute } from "./postToRoute.ts";
import { startRouteTestServer } from "./startRouteTestServer.ts";
import { tokenOf } from "./tokenOf.ts";

const DUMMY_HUMAN_CHECK = "XXXX.DUMMY.TOKEN.XXXX";
const STARTING_MS = 30_000;
const WANTED = { picture: "delapouite/bear-head", background: "#000000", color: "#FFFFFF" };

let server: TestHarness;

async function post(path: string, body: Readonly<Record<string, unknown>>) {
  return postToRoute(server, path, body);
}

async function newGuestToken(name: string): Promise<string> {
  return tokenOf(await post("/api/guests", { name, humanCheck: DUMMY_HUMAN_CHECK }));
}

beforeAll(async () => {
  server = await startRouteTestServer();
}, STARTING_MS);

afterAll(async () => {
  await server.close();
});

describe("the icon change route", () => {
  it(
    "gives a new guest an icon from the folder and saves a changed icon",
    async () => {
      const token = await newGuestToken("Iconguest");
      const before = await post("/api/account", { token });
      expect(before.status).toBe(200);
      expect(v.parse(AccountResponse, before.body)).toMatchObject({
        isLoggedIn: true,
        iconWait: null,
      });
      const changed = await post("/api/icon-changes", { token, icon: WANTED });
      const saved = { ...WANTED, color: "#ffffff" };
      expect(changed).toEqual({ status: 200, body: { isOk: true, icon: saved, iconWait: null } });
      const after = await post("/api/account", { token });
      expect(after.body).toMatchObject({ icon: saved });
    },
    STARTING_MS,
  );

  it(
    "refuses an unknown picture, colours that are too alike, a malformed icon and an unknown token",
    async () => {
      const token = await newGuestToken("Iconrefused");
      const unknown = { ...WANTED, picture: "delapouite/unicorn-made-up" };
      const alike = { ...WANTED, background: "#777777", color: "#888888" };
      const refusals = [
        [{ token, icon: unknown }, 400, "unknown_icon"],
        [{ token, icon: alike }, 400, "icon_colors_too_alike"],
        [{ token, icon: { ...WANTED, color: "white" } }, 400, "malformed_message"],
        [{ token: "0".repeat(64), icon: WANTED }, 401, "invalid_token"],
      ] as const;
      for (const [body, status, reason] of refusals) {
        expect(await post("/api/icon-changes", body)).toEqual({
          status,
          body: { isOk: false, reason },
        });
      }
    },
    STARTING_MS,
  );
});
