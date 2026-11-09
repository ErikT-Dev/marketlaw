export function roomTokenOf(name: string): string {
  return `token-of-${name.replace(/\W/g, "-")}`;
}
