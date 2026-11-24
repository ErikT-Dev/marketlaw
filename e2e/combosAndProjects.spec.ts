import { expect, test, type Browser, type ViewportSize } from "@playwright/test";
import { expectAllProjectsInView } from "./expectAllProjectsInView";
import { expectScreenFits } from "./expectScreenFits";
import { startTestRoom } from "./startTestRoom";

async function openSeat(browser: Browser, viewport: ViewportSize | null, link: string) {
  const context = await browser.newContext({ viewport: viewport ?? { width: 1920, height: 1080 } });
  const page = await context.newPage();
  await page.goto(link);
  await expect(page.getByRole("heading", { name: /^Turn \d+ of 40$/ })).toBeVisible();
  return page;
}

test("claim combos with the totals, complete a project, and get its funds without a first-completion extra", async ({
  browser,
  viewport,
  request,
}, testInfo) => {
  const [seatOne = "", seatTwo = ""] = await startTestRoom(request, {
    players: 2,
    seats: [{ seat: 1, city: ["Row House", "Fire Station"], stats: { quality: 8, income: 100 } }],
  });
  const ann = await openSeat(browser, viewport, seatOne);
  const bea = await openSeat(browser, viewport, seatTwo);

  const combos = ann.getByRole("region", { name: "Combos · 1 ready" });
  await expect(combos.getByRole("img", { name: "Safety" }).first()).toBeVisible();
  await expect(combos.getByRole("img", { name: "Quality +1" }).first()).toBeVisible();
  await expectScreenFits(ann, "combos-list", testInfo);
  await ann.getByRole("button", { name: "Claim all (1)" }).click();
  const claim = ann.getByRole("dialog", { name: "Claim all combos" });
  await expect(claim).toContainText("You will get in total");
  await expect(claim.getByRole("img", { name: "Safety" })).toBeVisible();
  await expect(claim.getByRole("img", { name: "Quality +1" }).first()).toBeVisible();
  await expect(claim.getByRole("img", { name: "Workforce +0" })).toBeVisible();
  await expect(claim.getByRole("img", { name: "Satisfaction +0" })).toBeVisible();
  await expectScreenFits(ann, "claim-all", testInfo);
  await claim.getByRole("button", { name: "Claim all" }).click();
  await expect(ann.getByRole("region", { name: "Combos · 0 ready" })).toBeVisible();
  await expect(ann.getByRole("img", { name: "Quality 9" })).toBeVisible();
  await expectAllProjectsInView(ann);

  const projectsArea = ann.getByRole("list", { name: "Your projects" });
  await expect(projectsArea.getByRole("listitem").first()).not.toContainText("First to complete");
  await ann.getByRole("button", { name: "How projects work" }).click();
  await expect(ann.getByRole("region", { name: "How projects work" })).toContainText(
    "You have 3 projects.",
  );
  await expectScreenFits(ann, "projects-help", testInfo);
  await ann.keyboard.press("Escape");
  await expect(ann.getByRole("region", { name: "How projects work" })).toHaveCount(0);

  await ann.getByRole("button", { name: "Projects", exact: true }).click();
  const projects = ann.getByRole("dialog", { name: "Projects" });
  const streets = projects.getByRole("listitem", { name: "Clean up the streets" });
  await expect(streets).not.toContainText("Nobody has completed it yet");
  for (const title of ["Clean up the streets", "Culture campaign", "Help the homeless"]) {
    const picture = projects.getByRole("img", { name: title });
    await expect
      .poll(async () => picture.evaluate((image: HTMLImageElement) => image.naturalWidth))
      .toBe(600);
  }
  await expectScreenFits(ann, "projects", testInfo);
  await streets.getByRole("button", { name: "Complete" }).click();
  await expect(ann.getByRole("img", { name: "Funds 90", exact: true })).toBeVisible();
  await expect(ann.getByRole("img", { name: "Quality 1" })).toBeVisible();

  await ann.getByRole("button", { name: "End turn" }).click();
  await bea.getByRole("button", { name: "End turn" }).click();
  await expect(ann.getByRole("heading", { name: "Turn 2 of 40" })).toBeVisible();
  await expect(ann.getByRole("img", { name: "Funds 201", exact: true })).toBeVisible();
  await Promise.all([ann, bea].map(async (page) => page.context().close()));
});
