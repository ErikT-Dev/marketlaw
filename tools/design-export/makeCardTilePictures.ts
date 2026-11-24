import { mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { chromium } from "playwright-core";
import { CARD_TILE_PICTURE_PATHS } from "./CARD_TILE_PICTURE_PATHS.ts";
import { toWebp } from "./toWebp.ts";

const TILE_PICTURE_SIZE = { width: 100, height: 86 };
const TILE_PICTURE_QUALITY = 0.72;

const browser = await chromium.launch();
const page = await browser.newPage();
const photos = readdirSync(CARD_TILE_PICTURE_PATHS.photos);
mkdirSync(CARD_TILE_PICTURE_PATHS.pictures, { recursive: true });
for (const photo of photos) {
  const source = readFileSync(`${CARD_TILE_PICTURE_PATHS.photos}/${photo}`);
  writeFileSync(
    `${CARD_TILE_PICTURE_PATHS.pictures}/${photo}`,
    await toWebp(page, source, TILE_PICTURE_SIZE, TILE_PICTURE_QUALITY),
  );
}
await browser.close();
console.log(`${String(photos.length)} card tile pictures`);
