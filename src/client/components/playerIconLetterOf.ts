const SEGMENTER = new Intl.Segmenter();

export function playerIconLetterOf(username: string): string {
  const first = SEGMENTER.segment(username)[Symbol.iterator]().next();
  return first.done === true ? "?" : first.value.segment.toUpperCase();
}
