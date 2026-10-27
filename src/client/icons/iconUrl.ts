export function iconUrl(iconFile: string): string {
  return new URL(`../assets/icons/${iconFile}.png`, import.meta.url).href;
}
