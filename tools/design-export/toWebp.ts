import type { Page } from "playwright-core";

export async function toWebp(
  page: Page,
  source: Buffer,
  size: { width: number; height: number },
  quality: number,
): Promise<Buffer> {
  const dataUrl = `data:image/jpeg;base64,${source.toString("base64")}`;
  const encoded = await page.evaluate(
    async ({ url, width, height, quality: webpQuality }) => {
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
      return canvas.toDataURL("image/webp", webpQuality);
    },
    { url: dataUrl, ...size, quality },
  );
  return Buffer.from(encoded.replace(/^data:image\/webp;base64,/, ""), "base64");
}
