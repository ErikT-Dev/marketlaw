import { expect, test } from "@playwright/test";
import { expectScreenFits } from "./expectScreenFits";
import { openTestSeat } from "./openTestSeat";
import { startTestRoom } from "./startTestRoom";

test("the big card shows a red name with the card-name combos it would make ready", async ({
  browser,
  viewport,
  request,
}, testInfo) => {
  const [seatOne = ""] = await startTestRoom(request, {
    players: 2,
    turn: 2,
    seats: [
      {
        seat: 1,
        city: ["Cottage", "Lake Park", "Fire Station"],
        hand: ["Hiking Trail", "Warehouse"],
      },
    ],
  });
  const ann = await openTestSeat(browser, viewport, seatOne);

  await ann
    .getByRole("list", { name: "Your hand" })
    .getByRole("button", { name: "Warehouse", exact: true })
    .click();
  const warehouse = ann.getByRole("region", { name: "Selected card: Warehouse" });
  await expect(warehouse.getByRole("button", { name: "Warehouse!" })).toHaveCount(0);

  await ann
    .getByRole("list", { name: "Your hand" })
    .getByRole("button", { name: "Hiking Trail", exact: true })
    .click();
  const shown = ann.getByRole("region", { name: "Selected card: Hiking Trail" });
  const name = shown.getByRole("button", { name: "Hiking Trail!" });
  await expect(name).toHaveText(/^Hiking Trail !/);
  const tooltip = shown.getByRole("tooltip").filter({ hasText: "Playing it makes" });
  await expect(tooltip).toBeHidden();
  await name.focus();
  await ann.keyboard.press("Shift+Tab");
  await ann.keyboard.press("Tab");
  await expect(name).toBeFocused();
  await expect(tooltip).toBeVisible();
  await expect(tooltip).toContainText("Playing it makes these combos ready:");
  await expect(tooltip).toContainText("#2 Cottage");
  await expect(tooltip).toContainText("Lake Park");
  await expect(tooltip.getByRole("img", { name: "Satisfaction 2" })).toBeVisible();
  await expect(
    shown.getByRole("group", {
      name: "Combo: Lake Park gives 1 satisfaction, that card is in your city, ready when played",
    }),
  ).toBeVisible();
  await name.blur();
  await expect(tooltip).toBeHidden();
  await name.hover();
  await expect(tooltip).toBeVisible();
  await expectScreenFits(ann, "big-card-card-name-combos", testInfo);
  await ann.context().close();
});

test("the big card names a combo's card on its number and sells the card shown after asking", async ({
  browser,
  viewport,
  request,
}) => {
  const [seatOne = ""] = await startTestRoom(request, {
    players: 2,
    turn: 2,
    seats: [{ seat: 1, city: ["Lake Park"], hand: ["Hiking Trail", "Warehouse"] }],
  });
  const ann = await openTestSeat(browser, viewport, seatOne);
  const hand = ann.getByRole("list", { name: "Your hand" });
  await hand.getByRole("button", { name: "Hiking Trail", exact: true }).click();
  const shown = ann.getByRole("region", { name: "Selected card: Hiking Trail" });
  const lakePark = shown.getByRole("tooltip").filter({ hasText: /^Lake Park$/ });
  await expect(lakePark).toBeHidden();
  await shown
    .getByRole("group", { name: /^Combo: Lake Park/ })
    .getByRole("button")
    .hover();
  await expect(lakePark).toBeVisible();

  await shown.getByRole("button", { name: "Sell" }).click();
  await expect(shown.getByText(/^Sell for/).getByRole("img", { name: "Funds 1" })).toBeVisible();
  await shown.getByRole("button", { name: "Sell" }).click();
  await expect(hand.getByRole("button", { name: "Hiking Trail", exact: true })).toHaveCount(0);
  await expect(hand.getByRole("button", { name: "Warehouse", exact: true })).toBeVisible();
  await ann.context().close();
});
