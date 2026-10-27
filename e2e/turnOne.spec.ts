import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Browser, type Page } from "@playwright/test";

type Player = { readonly page: Page; readonly frames: string[] };

async function newPlayer(browser: Browser, name: string): Promise<Player> {
  const context = await browser.newContext();
  const page = await context.newPage();
  const frames: string[] = [];
  page.on("websocket", (socket) => {
    socket.on("framereceived", (frame) => {
      frames.push(String(frame.payload));
    });
  });
  await page.goto("/");
  await page.getByLabel("Your name").fill(name);
  await page.getByRole("button", { name: "Continue" }).click();
  await expect(page.getByRole("heading", { name: `Hello, ${name}` })).toBeVisible();
  return { page, frames };
}

async function handOf(page: Page): Promise<ReadonlyArray<string>> {
  const items = page.getByRole("list", { name: "Your hand" }).getByRole("listitem");
  return items.evaluateAll((elements) =>
    elements.map((element) => element.querySelector("span")?.textContent ?? ""),
  );
}

async function sellFirstCardAndEndTurn(page: Page): Promise<void> {
  const [card] = await handOf(page);
  await page.getByRole("button", { name: `Sell ${card ?? ""}` }).click();
  await expect(page.getByRole("button", { name: `Sell ${card ?? ""}` })).toHaveCount(0);
  await page.getByRole("button", { name: "End turn" }).click();
}

test("two players play turn 1 together and never see each other's hands", async ({ browser }) => {
  const ann = await newPlayer(browser, "Ann");
  const bea = await newPlayer(browser, "Bea");
  await ann.page.getByRole("button", { name: "Create room" }).click();
  await expect(ann.page.getByRole("heading", { name: "Waiting for players" })).toBeVisible();
  const code = await ann.page.getByLabel("Room code").textContent();
  await bea.page.getByLabel("Room code").fill(code ?? "");
  await bea.page.getByRole("button", { name: "Join room" }).click();
  for (const player of [ann, bea]) {
    await expect(player.page.getByRole("heading", { name: "Turn 1" })).toBeVisible();
    expect(await new AxeBuilder({ page: player.page }).analyze()).toHaveProperty("violations", []);
  }
  const annStartingHand = await handOf(ann.page);
  const beaStartingHand = await handOf(bea.page);
  await sellFirstCardAndEndTurn(ann.page);
  const annFramesBeforeTurnEnds = ann.frames.length;
  await sellFirstCardAndEndTurn(bea.page);
  for (const player of [ann, bea]) {
    await expect(player.page.getByRole("heading", { name: "Turn 2" })).toBeVisible();
  }
  const annHand = await handOf(ann.page);
  const beaHand = await handOf(bea.page);
  for (const card of beaHand) {
    expect(ann.frames.some((frame) => frame.includes(`"${card}"`))).toBe(false);
  }
  for (const card of beaStartingHand) {
    const framesInTurnOne = ann.frames.slice(0, annFramesBeforeTurnEnds);
    expect(framesInTurnOne.some((frame) => frame.includes(`"${card}"`))).toBe(false);
  }
  expect(annStartingHand.length).toBeGreaterThan(0);
  for (const card of annHand) {
    expect(bea.frames.some((frame) => frame.includes(`"${card}"`))).toBe(false);
  }
  await ann.page.reload();
  await expect(ann.page.getByRole("heading", { name: "Turn 2" })).toBeVisible();
});
