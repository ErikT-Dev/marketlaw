const WHOLE_NUMBER_FROM_1_TO_99 = /^[1-9][0-9]?$/;

export function wholeNumberOf(word: string): number | null {
  return WHOLE_NUMBER_FROM_1_TO_99.test(word) ? Number(word) : null;
}
