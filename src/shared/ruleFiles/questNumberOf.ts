const WHOLE_NUMBER_FROM_1_TO_999 = /^[1-9][0-9]{0,2}$/;

export function questNumberOf(word: string): number | null {
  return WHOLE_NUMBER_FROM_1_TO_999.test(word) ? Number(word) : null;
}
