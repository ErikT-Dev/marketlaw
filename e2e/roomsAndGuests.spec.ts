import { expect, test } from "@playwright/test";
import { becomeGuest } from "./becomeGuest";
import { createRoomAs } from "./createRoomAs";
import { expectScreenFits } from "./expectScreenFits";
import { HUMAN_CHECK_MS } from "./HUMAN_CHECK_MS";
import { hiddenCardsSentToOthers } from "./hiddenCardsSentToOthers";
import { joinRoomAs } from "./joinRoomAs";
import { openLobby } from "./openLobby";
import { SIGNING_IN_TEST_MS } from "./SIGNING_IN_TEST_MS";

const ACCEPT_DIALOG = { name: "The room is full: accept the game?" };

test("guests get a name, create and join a room, all accept and a 3-player game starts", async ({
  browser,
  viewport,
}, testInfo) => {
  test.setTimeout(SIGNING_IN_TEST_MS);
  const size = viewport ?? { width: 1920, height: 1080 };
  const [host, joiner, last] = await Promise.all(
    ["Busy Harbour Mayor", "Quiet River Baron", "Bea"].map(async (base) =>
      openLobby(browser, base, size),
    ),
  );
  if (host === undefined || joiner === undefined || last === undefined) {
    throw new Error("no players");
  }
  await host.page.getByRole("button", { name: "Create room" }).click();
  const prompt = host.page.getByRole("dialog", { name: "Choose a username" });
  await expect(prompt.getByRole("textbox", { name: "Username" })).not.toHaveValue("");
  await expect(prompt.getByRole("button", { name: "Continue" })).toBeEnabled({
    timeout: HUMAN_CHECK_MS,
  });
  await expectScreenFits(host.page, "guest-name-prompt", testInfo, true);
  await becomeGuest(host);
  const create = host.page.getByRole("dialog", { name: "Create a room" });
  await create.getByRole("button", { name: "3 players" }).click();
  await expect(create.getByRole("button", { name: "Create room" })).toBeEnabled({
    timeout: HUMAN_CHECK_MS,
  });
  await expectScreenFits(host.page, "create-room", testInfo, true);
  await create.getByRole("button", { name: "Create room" }).click();
  const heading = host.page.getByRole("heading", { name: /^Room [A-Z0-9]{6}$/ });
  const code = ((await heading.textContent()) ?? "").replace("Room ", "");
  await expect(host.page.getByText("Public room · you are the owner")).toBeVisible();
  await expectScreenFits(host.page, "waiting-room-owner", testInfo);

  await joiner.page.getByRole("textbox", { name: "Room code" }).fill("ZZZZZZ");
  await joiner.page.getByRole("button", { name: "Join with code" }).click();
  await becomeGuest(joiner);
  await expect(joiner.page.getByRole("alert")).toHaveText(
    "No room has the code ZZZZZZ. Check the code and try again.",
  );
  await expectScreenFits(joiner.page, "join-error", testInfo);
  await joiner.page.getByRole("textbox", { name: "Room code" }).fill(code);
  await joiner.page.getByRole("button", { name: "Join with code" }).click();
  await expect(joiner.page.getByText(`Public room · owner: ${host.name}`)).toBeVisible();
  await expect(joiner.page.getByRole("button", { name: "4 players" })).toBeDisabled();
  await expectScreenFits(joiner.page, "waiting-room-not-owner", testInfo);

  await joinRoomAs(last, code);
  await host.page
    .getByRole("dialog", ACCEPT_DIALOG)
    .getByRole("button", { name: "Accept" })
    .click();
  await expect(joiner.page.getByRole("dialog", ACCEPT_DIALOG)).toContainText(
    `Accepted so far: ${host.name}`,
  );
  await expectScreenFits(joiner.page, "accept-the-game", testInfo);
  for (const player of [joiner, last]) {
    await player.page
      .getByRole("dialog", ACCEPT_DIALOG)
      .getByRole("button", { name: "Accept" })
      .click();
  }
  for (const player of [host, joiner, last]) {
    await expect(player.page.getByRole("heading", { name: "Turn 1 of 40" })).toBeVisible();
  }
  expect(await hiddenCardsSentToOthers([host, joiner, last])).toEqual([]);
  await Promise.all([host, joiner, last].map(async (player) => player.page.context().close()));
});

test("a player who declines is removed and told when they can join the room again", async ({
  browser,
  viewport,
}, testInfo) => {
  test.setTimeout(SIGNING_IN_TEST_MS);
  const size = viewport ?? { width: 1920, height: 1080 };
  const host = await openLobby(browser, "Ann", size);
  const decliner = await openLobby(browser, "Cy", size);
  const code = await createRoomAs(host, 2);
  await joinRoomAs(decliner, code);
  await decliner.page
    .getByRole("dialog", ACCEPT_DIALOG)
    .getByRole("button", { name: "Decline" })
    .click();
  const removed = decliner.page
    .getByRole("status")
    .filter({ hasText: `Removed from room ${code}` });
  await expect(removed).toContainText(
    /You declined the game\. You can join that room again in 1:5\d\./,
  );
  await expectScreenFits(decliner.page, "removed-from-room", testInfo);
  await decliner.page.getByRole("textbox", { name: "Room code" }).fill(code);
  await decliner.page.getByRole("button", { name: "Join with code" }).click();
  await expect(decliner.page.getByRole("alert")).toHaveText(
    /^You can join this room again in 1:5\d\.$/,
  );
  await expect(host.page.getByRole("dialog", ACCEPT_DIALOG)).toBeHidden();
  await expect(host.page.getByText("Free place: waiting for 1 more player")).toBeVisible();
  await Promise.all([host, decliner].map(async (player) => player.page.context().close()));
});
