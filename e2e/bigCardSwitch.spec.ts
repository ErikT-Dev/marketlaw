import { expect, test, type Page } from "@playwright/test";
import { CARDS } from "../src/shared/catalogue/CARDS";
import { cardsHeldOnce } from "./cardsHeldOnce";
import { startGame } from "./startGame";

const CARDS_TO_CLICK = 4;
const LONGEST_SWITCH_MS = 100;

function photoNameOf(card: string): string {
  const photo = CARDS.find(({ name }) => name === card)?.photo ?? "";
  return photo.replace(/\.[a-z]+$/i, "");
}

async function msUntilShownInFull(page: Page, card: string): Promise<number> {
  return page.evaluate(
    async ({ name, photoName }) => {
      const hand = document.querySelector('[aria-label="Your hand"]');
      const button = hand?.querySelector(`button[aria-label="${name}"]`);
      if (!(button instanceof HTMLButtonElement)) {
        throw new Error(`no hand card ${name}`);
      }
      function isShownInFull(): boolean {
        const panel = document.querySelector(`[aria-label="Selected card: ${name}"]`);
        const photos = [...(panel?.querySelectorAll("article img") ?? [])];
        const photo = photos.find(
          (image) => image instanceof HTMLImageElement && image.src.includes(photoName),
        );
        return (
          button?.getAttribute("aria-pressed") === "true" &&
          photo instanceof HTMLImageElement &&
          photo.complete &&
          photo.naturalWidth > 0
        );
      }
      const clickedAt = performance.now();
      button.click();
      return new Promise<number>((resolve) => {
        function check() {
          if (isShownInFull()) {
            resolve(performance.now() - clickedAt);
            return;
          }
          requestAnimationFrame(check);
        }
        check();
      });
    },
    { name: card, photoName: photoNameOf(card) },
  );
}

test("each hand card clicked is shown in full with its own photo within 100 ms", async ({
  browser,
  viewport,
}) => {
  const loadedPhotos: Array<string> = [];
  const players = await startGame(
    browser,
    viewport ?? { width: 1920, height: 1080 },
    ["Ann", "Bea"],
    async ([first]) => {
      first?.page.on("requestfinished", (request) => {
        loadedPhotos.push(request.url());
      });
      return Promise.resolve();
    },
  );
  const ann = players[0]?.page;
  if (ann === undefined) {
    throw new Error("no players");
  }
  const cards = (await cardsHeldOnce(ann)).slice(0, CARDS_TO_CLICK);
  expect(cards.length).toBe(CARDS_TO_CLICK);
  await expect
    .poll(() => cards.every((card) => loadedPhotos.some((url) => url.includes(photoNameOf(card)))))
    .toBe(true);
  for (const card of cards) {
    expect(await msUntilShownInFull(ann, card)).toBeLessThan(LONGEST_SWITCH_MS);
  }
  await Promise.all(players.map(async (player) => player.page.context().close()));
});
