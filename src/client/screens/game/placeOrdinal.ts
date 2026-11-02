const ORDINALS = ["1st", "2nd", "3rd", "4th"];

export function placeOrdinal(index: number): string {
  return ORDINALS[index] ?? `${String(index + 1)}th`;
}
