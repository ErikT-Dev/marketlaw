import { expect, test, type Page } from "@playwright/test";
import { expectScreenFits } from "./expectScreenFits";
import { openLobby } from "./openLobby";
import { signUpInLobby } from "./signUpInLobby";
import { SIGNING_IN_TEST_MS } from "./SIGNING_IN_TEST_MS";

const PASSWORD = "harbour lights 42";

async function openRanking(page: Page) {
  await page.getByRole("button", { name: "ELO ranking" }).click();
  const ranking = page.getByRole("dialog", { name: "ELO ranking" });
  await expect(ranking.getByRole("button", { name: "Jump to me" })).toBeVisible();
  return ranking;
}

test("a visitor and then a new registered user open the ELO ranking from the lobby", async ({
  browser,
  viewport,
}, testInfo) => {
  test.setTimeout(SIGNING_IN_TEST_MS);
  const { page, name } = await openLobby(
    browser,
    "Ranking Reader",
    viewport ?? { width: 1920, height: 1080 },
  );
  const visitorRanking = await openRanking(page);
  await expect(visitorRanking).toContainText("Log in to find your place in the ranking.");
  await expect(visitorRanking.getByRole("button", { name: "Jump to me" })).toBeDisabled();
  await expectScreenFits(page, "ranking", testInfo);
  await visitorRanking.getByRole("button", { name: "Back" }).click();
  await expect(visitorRanking).toBeHidden();

  await signUpInLobby(
    page,
    name,
    `${name.replaceAll(" ", ".").toLowerCase()}@example.com`,
    PASSWORD,
  );
  const checkEmail = page.getByRole("dialog", { name: "Check your email" });
  await checkEmail.getByRole("button", { name: "OK" }).click();
  await expect(checkEmail).toBeHidden();
  const userRanking = await openRanking(page);
  await expect(userRanking).toContainText(
    "You are not in the ranking yet: it lists registered players who have played at least 1 ranked game. Join the ranked queue from the lobby.",
  );
  await expect(userRanking.getByRole("button", { name: "Jump to me" })).toBeDisabled();
  await expectScreenFits(page, "ranking-not-in-it-yet", testInfo);
  await page.keyboard.press("Escape");
  await expect(userRanking).toBeHidden();
  await expect(page.getByRole("button", { name: "Create room" })).toBeVisible();
});
