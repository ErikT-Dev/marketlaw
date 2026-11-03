const TAG_LENGTH = 4;
const LONGEST = 20;

export function uniqueName(base: string): string {
  const tag = Math.random()
    .toString(36)
    .slice(2, 2 + TAG_LENGTH)
    .padEnd(TAG_LENGTH, "0");
  return `${base.slice(0, LONGEST - TAG_LENGTH - 1).trimEnd()} ${tag}`;
}
