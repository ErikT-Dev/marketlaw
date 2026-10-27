export function photoUrl(photo: string): string {
  const name = photo.replace(/\.[a-z]+$/i, "");
  return new URL(`../assets/cards/${name}.webp`, import.meta.url).href;
}
