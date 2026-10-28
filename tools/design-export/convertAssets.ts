import { mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { chromium, type Page } from "playwright-core";
import { isRecord } from "../harness-check/isRecord.ts";
import { DESIGN_EXPORT_PATHS } from "./DESIGN_EXPORT_PATHS.ts";
import { readZipEntries } from "./readZipEntries.ts";

const OUTPUT = "src/client/assets";
const LIBRARY = `${DESIGN_EXPORT_PATHS.root}/library/library.penpot`;
const PHOTO_SIZE = { width: 554, height: 478 };
const BACKGROUNDS = [
  { source: "hafidh-satyanto-UytSb_a2YE0-unsplash.jpg", output: "game", width: 1920, height: 1436 },
  {
    source: "dana-devolk-E0BdstzaO8E-unsplash.jpg",
    output: "card-texture",
    width: 630,
    height: 900,
  },
] as const;
const WEBP_QUALITY = 0.72;

type MediaEntry = { readonly name: string; readonly mediaId: string; readonly createdAt: string };

function mediaEntries(entries: ReadonlyMap<string, () => Buffer>): ReadonlyArray<MediaEntry> {
  return [...entries]
    .filter(([name]) => name.includes("/media/") && name.endsWith(".json"))
    .flatMap(([, read]) => {
      const media: unknown = JSON.parse(read().toString("utf8"));
      return isRecord(media) &&
        media["mtype"] === "image/png" &&
        typeof media["name"] === "string" &&
        typeof media["mediaId"] === "string"
        ? [
            {
              name: media["name"],
              mediaId: media["mediaId"],
              createdAt: String(media["createdAt"]),
            },
          ]
        : [];
    });
}

function extractIcons(): number {
  const entries = readZipEntries(LIBRARY);
  const newestByName = new Map<string, MediaEntry>();
  for (const media of mediaEntries(entries)) {
    const known = newestByName.get(media.name);
    if (known === undefined || known.createdAt < media.createdAt) {
      newestByName.set(media.name, media);
    }
  }
  mkdirSync(`${OUTPUT}/icons`, { recursive: true });
  for (const media of newestByName.values()) {
    const read = entries.get(`objects/${media.mediaId}.png`);
    if (read !== undefined) {
      writeFileSync(`${OUTPUT}/icons/${media.name}.png`, read());
    }
  }
  return newestByName.size;
}

async function toWebp(
  page: Page,
  source: Buffer,
  size: { width: number; height: number },
): Promise<Buffer> {
  const dataUrl = `data:image/jpeg;base64,${source.toString("base64")}`;
  const encoded = await page.evaluate(
    async ({ url, width, height, quality }) => {
      const image = new Image();
      image.src = url;
      await image.decode();
      const scale = Math.max(width / image.width, height / image.height);
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const drawn = { width: image.width * scale, height: image.height * scale };
      canvas
        .getContext("2d")
        ?.drawImage(
          image,
          (width - drawn.width) / 2,
          (height - drawn.height) / 2,
          drawn.width,
          drawn.height,
        );
      return canvas.toDataURL("image/webp", quality);
    },
    { url: dataUrl, ...size, quality: WEBP_QUALITY },
  );
  return Buffer.from(encoded.replace(/^data:image\/webp;base64,/, ""), "base64");
}

async function convertPhotos(): Promise<number> {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const photos = readdirSync(`${DESIGN_EXPORT_PATHS.assets}/cardImages`);
  mkdirSync(`${OUTPUT}/cards`, { recursive: true });
  mkdirSync(`${OUTPUT}/backgrounds`, { recursive: true });
  for (const photo of photos) {
    const source = readFileSync(`${DESIGN_EXPORT_PATHS.assets}/cardImages/${photo}`);
    const name = photo.replace(/\.[a-z]+$/i, "");
    writeFileSync(`${OUTPUT}/cards/${name}.webp`, await toWebp(page, source, PHOTO_SIZE));
  }
  for (const background of BACKGROUNDS) {
    const source = readFileSync(`${DESIGN_EXPORT_PATHS.assets}/backgrounds/${background.source}`);
    writeFileSync(
      `${OUTPUT}/backgrounds/${background.output}.webp`,
      await toWebp(page, source, background),
    );
  }
  await browser.close();
  return photos.length;
}

const iconCount = extractIcons();
const photoCount = await convertPhotos();
console.log(
  `${String(iconCount)} icons, ${String(photoCount)} card photos, ${String(BACKGROUNDS.length)} backgrounds`,
);
