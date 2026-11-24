import { mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { chromium } from "playwright-core";
import { PROJECT_PICTURE_PATHS } from "./PROJECT_PICTURE_PATHS.ts";
import { toWebp } from "./toWebp.ts";

const PROJECT_PICTURE_SIZE = { width: 600, height: 400 };
const PROJECT_PICTURE_QUALITY = 0.72;

const browser = await chromium.launch();
const page = await browser.newPage();
const photos = readdirSync(PROJECT_PICTURE_PATHS.photos);
mkdirSync(PROJECT_PICTURE_PATHS.pictures, { recursive: true });
for (const photo of photos) {
  const source = readFileSync(`${PROJECT_PICTURE_PATHS.photos}/${photo}`);
  writeFileSync(
    `${PROJECT_PICTURE_PATHS.pictures}/${photo.replace(/\.[a-z]+$/i, "")}.webp`,
    await toWebp(page, source, PROJECT_PICTURE_SIZE, PROJECT_PICTURE_QUALITY),
  );
}
await browser.close();
console.log(`${String(photos.length)} project pictures`);
