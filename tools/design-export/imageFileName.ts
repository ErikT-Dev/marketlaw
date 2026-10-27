export function imageFileName(boardName: string): string {
  return `${boardName.replace(/[\\/:*?"<>|]/g, "-").trim()}.png`;
}
