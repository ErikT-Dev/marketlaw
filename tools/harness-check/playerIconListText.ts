export function playerIconListText(pictures: ReadonlyArray<string>): string {
  const lines = pictures.map((picture) => `  ${JSON.stringify(picture)},`);
  return ["export const PLAYER_ICON_PICTURES = [", ...lines, "] as const;", ""].join("\n");
}
