import { expect, test } from "@playwright/test";
import { DUMMY_HUMAN_CHECK } from "./DUMMY_HUMAN_CHECK";
import { uniqueName } from "./uniqueName";

test("a username is taken whatever its capital letters, and the human check is required", async ({
  request,
}) => {
  const name = uniqueName("Harbour Mayor");
  const first = await request.post("/api/guests", {
    data: { name, humanCheck: DUMMY_HUMAN_CHECK },
  });
  expect(await first.json()).toHaveProperty("isOk", true);
  const sameIgnoringCapitals = await request.post("/api/guests", {
    data: { name: name.toUpperCase(), humanCheck: DUMMY_HUMAN_CHECK },
  });
  expect(await sameIgnoringCapitals.json()).toEqual({ isOk: false, reason: "username_taken" });
  const withoutCheck = await request.post("/api/guests", {
    data: { name: uniqueName("Quiet Mayor"), humanCheck: "" },
  });
  expect(await withoutCheck.json()).toEqual({ isOk: false, reason: "human_check_failed" });
});
