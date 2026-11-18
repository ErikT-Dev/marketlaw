export function compareAlphabetically(name: string, other: string): number {
  return name.localeCompare(other, "en");
}
