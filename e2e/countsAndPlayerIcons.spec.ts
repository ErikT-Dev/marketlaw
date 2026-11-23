import { expect, test } from "@playwright/test";
import { expectScreenFits } from "./expectScreenFits";
import { openTestSeat } from "./openTestSeat";
import { startTestRoom } from "./startTestRoom";

const SEAT_TWO_CITY = [
  "Farm House",
  "Cottage",
  "Winery",
  "Orchard",
  "Slaughterhouse",
  "Windmill Park",
];

const MOST_PLAYED_TYPES = [
  "Food 2",
  "Light Industry 2",
  "Low Wealth 2",
  "Raw Material 2",
  "Suburban Housing 2",
];

test("your counts, another player's counts and most played types, and a project completed by another player's icon", async ({
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
        quests_completed: ["Countryside"],
        worth_gained: 17,
      },
      {
        seat: 2,
        city: SEAT_TWO_CITY,
        projects: ["quality"],
        quests_completed: ["Countryside", "Working district"],
        combos_claimed: [{ card: "Farm House", combo: "1 Farm", times: 1 }],
        worth_gained: 20,
      },
    ],
  });
  const ann = await openTestSeat(browser, viewport, seatOne);

  const yourCounts = ann.getByRole("list", { name: "Your counts" });
  await expect(yourCounts.getByRole("img", { name: "Quests completed 1" })).toBeVisible();
  await expect(yourCounts.getByRole("img", { name: "Types in your city 5" })).toBeVisible();
  await expect(yourCounts.getByRole("img", { name: "Combos claimed 0" })).toBeVisible();
  await expect(yourCounts.getByRole("img", { name: "Total worth gained 17.0" })).toBeVisible();

  const bea = ann.getByRole("article", { name: "Quick summary table of Seat 2" });
  await expect(bea.getByRole("img", { name: "Quests completed 2" })).toBeVisible();
  await expect(bea.getByRole("img", { name: "Types in their city 13" })).toBeVisible();
  await expect(bea.getByRole("img", { name: "Combos claimed 1" })).toBeVisible();
  await expect(bea.getByRole("img", { name: "Total worth gained 20.0" })).toBeVisible();
  const mostPlayed = bea
    .getByRole("list", { name: "Types played most by Seat 2" })
    .getByRole("img");
  await expect(mostPlayed).toHaveCount(MOST_PLAYED_TYPES.length);
  for (const [index, type] of MOST_PLAYED_TYPES.entries()) {
    await expect(mostPlayed.nth(index)).toHaveAccessibleName(type);
  }

  const quality = ann
    .getByRole("list", { name: "Your projects" })
    .getByRole("listitem")
    .filter({ hasText: "Completed by" });
  await expect(quality).toHaveCount(1);
  const beaIcon = quality.getByRole("button", { name: "Seat 2" });
  await expect(beaIcon).toHaveText(/^S/);
  await beaIcon.focus();
  await expect(beaIcon).toBeFocused();
  await expectScreenFits(ann, "projects-completed-by", testInfo);
  await ann.context().close();
});

test("the Redraw hand button counts down its redraws and goes away after the third", async ({
  browser,
  viewport,
  request,
}) => {
  const [seatOne = ""] = await startTestRoom(request, { players: 2 });
  const ann = await openTestSeat(browser, viewport, seatOne);
  for (const left of [3, 2, 1]) {
    await ann.getByRole("button", { name: `Redraw hand (${String(left)} left)` }).click();
    await expect(
      ann.getByRole("button", { name: `Redraw hand (${String(left)} left)` }),
    ).toHaveCount(0);
  }
  await expect(ann.getByRole("button", { name: /^Redraw hand/ })).toHaveCount(0);
  await ann.context().close();
});
