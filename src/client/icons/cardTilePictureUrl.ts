export function cardTilePictureUrl(photo: string): string {
  const name = photo.replace(/\.[a-z]+$/i, "");
  return new URL(`../assets/card-tiles/${name}.webp`, import.meta.url).href;
}
