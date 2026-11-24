import { expect, test, type Page } from "@playwright/test";
import { expectScreenFits } from "./expectScreenFits";
import { startTestRoom } from "./startTestRoom";

async function playFromHand(page: Page, card: string) {
  await page
    .getByRole("list", { name: "Your hand" })
    .getByRole("button", { name: card, exact: true })
    .click();
  await page
    .getByRole("region", { name: `Selected card: ${card}` })
    .getByRole("button", { name: "Play card" })
    .click();
}

function residentialCity(page: Page) {
  return page.getByRole("list", { name: "Your Residential cards" }).getByRole("listitem");
}

test("trade influence, buy a build pass for a second card, undo it, and draw a chosen kind", async ({
  page,
  request,
}, testInfo) => {
  const [seatOne = ""] = await startTestRoom(request, {
    players: 2,
    seats: [{ seat: 1, hand: ["Row House", "Cottage"], stats: { funds: 200, influence: 10 } }],
  });
  await page.goto(seatOne);
  await expect(page.getByRole("heading", { name: "Turn 1 of 40" })).toBeVisible();

  await page.getByRole("button", { name: "Use Influence" }).click();
  const influence = page.getByRole("dialog", { name: "Use Influence" });
  await expectScreenFits(page, "use-influence", testInfo);
  await influence.getByRole("button", { name: "10 funds → 1 influence" }).click();
  await expect(influence.getByRole("img", { name: "Influence 11" })).toBeVisible();
  await influence.getByRole("button", { name: "20 funds → 1 build pass" }).click();
  await expect(influence.getByRole("button", { name: "30 funds → 1 build pass" })).toBeEnabled();
  await influence.getByRole("button", { name: "Close" }).click();
  await expect(page.getByRole("img", { name: "Build passes 2" })).toBeVisible();

  await playFromHand(page, "Row House");
  await expect(residentialCity(page)).toHaveCount(1);
  await playFromHand(page, "Cottage");
  await expect(residentialCity(page)).toHaveCount(2);
  await expect(page.getByRole("img", { name: "Build passes 0" })).toBeVisible();

  await page.getByRole("button", { name: "Undo" }).click();
  await expect(residentialCity(page)).toHaveCount(1);
  await expect(page.getByRole("img", { name: "Build passes 1" })).toBeVisible();
  await expect(
    page.getByRole("list", { name: "Your hand" }).getByRole("button", { name: "Cottage" }),
  ).toBeVisible();

  await page.getByRole("button", { name: "Use Influence" }).click();
  await influence.getByRole("button", { name: "Draw Industry tier 1" }).click();
  await expect(influence.getByRole("img", { name: "Influence 8" })).toBeVisible();
  await influence.getByRole("button", { name: "Close" }).click();
  await expect(page.getByRole("list", { name: "Your hand" }).getByRole("button")).toHaveCount(2);
  await expect(page.getByRole("button", { name: "Undo" })).toBeDisabled();
});
