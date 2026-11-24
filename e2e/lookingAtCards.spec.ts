import { expect, test } from "@playwright/test";
import { expectScreenFits } from "./expectScreenFits";
import { openTestSeat } from "./openTestSeat";
import { startTestRoom } from "./startTestRoom";

test("every card in the marketplace and in the cities opens the big card", async ({
  browser,
  viewport,
  request,
}, testInfo) => {
  const [seatOne = ""] = await startTestRoom(request, {
    players: 2,
    marketplace: [
      { place: "residential", card: "Row House" },
      { place: "industry", card: "Metal Mining" },
      { place: "service", card: "Liquor Shop" },
      { place: "public_quality", card: "Fire Station" },
      { place: "public_satisfaction", card: "Public Playground" },
      { place: "open_1", card: "Dentist" },
      { place: "open_2", card: "Apparel Store" },
      { place: "open_3", card: "Forest Plantation" },
    ],
    seats: [
      { seat: 1, city: ["Row House", "Lake Park"] },
      { seat: 2, city: ["Cottage", "Lake Park"] },
    ],
  });
  const ann = await openTestSeat(browser, viewport, seatOne);

  const marketplace = ann.getByRole("list", { name: "Marketplace places" });
  await marketplace.getByRole("button", { name: "Dentist" }).click();
  const shownMarketCard = ann.getByRole("region", { name: "Selected card: Dentist" });
  await expect(shownMarketCard.getByRole("heading", { name: /^Base cost/ })).toBeVisible();
  await expect(shownMarketCard.getByRole("button").filter({ hasNotText: /^#[0-9]/ })).toHaveText([
    "Close",
  ]);
  await expect(marketplace.getByRole("button", { name: "Draw" })).toHaveCount(0);

  await ann
    .getByRole("region", { name: /^Your city/ })
    .getByRole("button", { name: "Lake Park" })
    .click();
  const shownCityCard = ann.getByRole("region", { name: "Selected card: Lake Park" });
  await expect(shownCityCard.getByRole("img", { name: "Beautification" })).toHaveCount(2);
  await expectScreenFits(ann, "big-card-city-doubled-type", testInfo);
  await shownCityCard.getByRole("button", { name: "Close" }).click();
  await expect(ann.getByRole("region", { name: /^Selected card: / })).toHaveCount(0);

  await ann.getByRole("button", { name: "Detailed summary table of Seat 2" }).click();
  const board = ann.getByRole("dialog", { name: "Detailed summary table of Seat 2" });
  await board.getByRole("button", { name: "Lake Park" }).click();
  const shownInBoard = board.getByRole("region", { name: "Selected card: Lake Park" });
  await expect(shownInBoard.getByRole("img", { name: "Beautification" })).toHaveCount(2);
  await expectScreenFits(ann, "opponent-board-big-card", testInfo);
  await shownInBoard.getByRole("button", { name: "Close" }).click();
  await expect(board.getByRole("region", { name: "Stats of Seat 2" })).toBeVisible();
  await ann.context().close();
});
