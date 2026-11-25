import { expect, test, type Browser, type ViewportSize } from "@playwright/test";
import { activate } from "./activate";
import type { Player } from "./Player";
import { startTestRoom } from "./startTestRoom";

async function openKeyboardOnlySeat(
  browser: Browser,
  viewport: ViewportSize | null,
  link: string,
): Promise<Player> {
  const context = await browser.newContext({ viewport: viewport ?? { width: 1920, height: 1080 } });
  await context.addInitScript(() => {
    document.addEventListener(
      "pointerdown",
      () => {
        document.documentElement.dataset["pointerUsed"] = "yes";
      },
      { capture: true },
    );
  });
  const page = await context.newPage();
  await page.goto(link);
  await expect(page.getByRole("heading", { name: "Turn 1 of 40" })).toBeVisible();
  return { page, frames: [], name: "", isKeyboardOnly: true };
}

test("play a card to the city, use influence and complete a project with the keyboard only", async ({
  browser,
  viewport,
  request,
}) => {
  const [seatOne = ""] = await startTestRoom(request, {
    players: 2,
    seats: [
      {
        seat: 1,
        hand: ["Row House"],
        stats: { funds: 200, influence: 10, quality: 10, income: 100, satisfaction: 2 },
      },
    ],
  });
  const ann = await openKeyboardOnlySeat(browser, viewport, seatOne);
  const { page } = ann;

  await activate(ann, page.getByRole("button", { name: "Use Influence" }));
  const influence = page.getByRole("dialog", { name: "Use Influence" });
  await activate(ann, influence.getByRole("button", { name: "10 funds → 1 influence" }));
  await expect(influence.getByRole("img", { name: "Influence 11" })).toBeVisible();
  await activate(ann, influence.getByRole("button", { name: "Close" }));
  await expect(influence).toHaveCount(0);
  await expect(page.getByRole("img", { name: "Funds 190", exact: true })).toBeVisible();

  await activate(
    ann,
    page
      .getByRole("list", { name: "Your hand" })
      .getByRole("button", { name: "Row House", exact: true }),
  );
  await activate(
    ann,
    page
      .getByRole("region", { name: "Selected card: Row House" })
      .getByRole("button", { name: "Play card" }),
  );
  await expect(
    page.getByRole("list", { name: "Your Residential cards" }).getByRole("listitem"),
  ).toHaveCount(1);

  await activate(ann, page.getByRole("button", { name: "Projects", exact: true }));
  const projects = page.getByRole("dialog", { name: "Projects" });
  await activate(
    ann,
    projects
      .getByRole("listitem", { name: "Clean up the streets" })
      .getByRole("button", { name: "Complete" }),
  );
  await expect(page.getByRole("img", { name: "Quality 0" })).toBeVisible();

  expect(
    await page.evaluate(() => document.documentElement.dataset["pointerUsed"]),
  ).toBeUndefined();
  await page.context().close();
});
