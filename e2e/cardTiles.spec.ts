import { expect, test, type Locator, type Page } from "@playwright/test";
import { CARD_NAMES } from "../src/shared/catalogue/CARD_NAMES";
import { expectScreenFits } from "./expectScreenFits";
import { openTestSeat } from "./openTestSeat";
import { startTestRoom } from "./startTestRoom";

const MARKET_PLACES = [
  "residential",
  "industry",
  "service",
  "public_quality",
  "public_satisfaction",
  "open_1",
  "open_2",
  "open_3",
] as const;

const TEXT_AREA_SHARE = 0.62;

async function namesThatDoNotFit(tiles: Locator): Promise<ReadonlyArray<string>> {
  return tiles.evaluateAll((buttons, textAreaShare) => {
    function doesNotFit(tile: Element): boolean {
      const box = tile.getBoundingClientRect();
      const style = getComputedStyle(tile);
      const bottom =
        box.bottom - parseFloat(style.borderBottomWidth) - parseFloat(style.paddingBottom);
      const right = box.left + box.width * textAreaShare + 1;
      return [...tile.children]
        .filter((child) => getComputedStyle(child).position === "relative")
        .some((child) => {
          const shown = child.getBoundingClientRect();
          return (
            shown.bottom > bottom + 0.5 ||
            shown.right > right ||
            child.scrollWidth > child.clientWidth
          );
        });
    }
    return buttons
      .filter((tile) => doesNotFit(tile))
      .map((tile) => tile.getAttribute("aria-label") ?? "");
  }, TEXT_AREA_SHARE);
}

async function tileSizes(tiles: Locator): Promise<ReadonlyArray<string>> {
  const sizes = await tiles.evaluateAll((buttons) =>
    buttons.map((tile) => {
      const { width, height } = tile.getBoundingClientRect();
      return `${String(Math.round(width))}x${String(Math.round(height))}`;
    }),
  );
  return [...new Set(sizes)];
}

function handTiles(page: Page): Locator {
  return page.getByRole("list", { name: "Your hand" }).getByRole("button");
}

function cityTiles(page: Page): Locator {
  return page.getByRole("list", { name: /^Your \w+ cards$/ }).getByRole("button");
}

test("every card name fits its hand and city tile, and every tile of a kind has one size", async ({
  browser,
  viewport,
  request,
}, testInfo) => {
  const [seatOne = ""] = await startTestRoom(request, {
    players: 2,
    seats: [{ seat: 1, hand: CARD_NAMES, city: CARD_NAMES }],
  });
  const page = await openTestSeat(browser, viewport, seatOne);
  await expect(handTiles(page)).toHaveCount(CARD_NAMES.length);
  await expect(cityTiles(page)).toHaveCount(CARD_NAMES.length);
  expect(await namesThatDoNotFit(handTiles(page))).toEqual([]);
  expect(await namesThatDoNotFit(cityTiles(page))).toEqual([]);
  expect(await tileSizes(handTiles(page))).toHaveLength(1);
  expect(await tileSizes(cityTiles(page))).toEqual(["140x94"]);
  await page.context().close();
  const [smallHand = ""] = await startTestRoom(request, {
    players: 2,
    seats: [
      {
        seat: 1,
        hand: ["Semiconductor Fabrication Plant", "Cafe", "Clinic", "Prison", "Loft", "Saw Mill"],
        city: ["Oil and Natural Gas Drilling", "Row House", "Dentist", "Fire Station", "Dorm"],
      },
    ],
    marketplace: [
      { place: "open_1", card: "Personal Care Products Industry", phases_shown: 1 },
      { place: "residential", card: "Farm House" },
    ],
  });
  const shown = await openTestSeat(browser, viewport, smallHand);
  await expectScreenFits(shown, "card-tiles", testInfo);
  await shown.context().close();
});

test("every card name fits its marketplace tile", async ({ browser, viewport, request }) => {
  test.setTimeout(240_000);
  const groups = [...Array(CARD_NAMES.length / MARKET_PLACES.length).keys()].map((group) =>
    CARD_NAMES.slice(group * MARKET_PLACES.length, (group + 1) * MARKET_PLACES.length),
  );
  const links = await Promise.all(
    groups.map(async (cards) => {
      const [seatOne = ""] = await startTestRoom(request, {
        players: 2,
        marketplace: cards.map((card, index) => ({ place: MARKET_PLACES[index], card })),
      });
      return seatOne;
    }),
  );
  const page = await openTestSeat(browser, viewport, links[0] ?? "");
  const tooLong: Array<string> = [];
  const sizes = new Set<string>();
  for (const link of links) {
    await page.goto("about:blank");
    await page.goto(link);
    const tiles = page.getByRole("list", { name: "Marketplace places" }).getByRole("button");
    await expect(tiles).toHaveCount(MARKET_PLACES.length);
    tooLong.push(...(await namesThatDoNotFit(tiles)));
    for (const size of await tileSizes(tiles)) {
      sizes.add(size);
    }
  }
  expect(tooLong).toEqual([]);
  expect(sizes.size).toBe(1);
  await page.context().close();
});
