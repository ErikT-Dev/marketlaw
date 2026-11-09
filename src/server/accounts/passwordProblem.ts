const SHORTEST = 8;
const LONGEST = 64;

export function passwordProblem(password: string): "password_invalid" | null {
  const length = [...new Intl.Segmenter(undefined, { granularity: "grapheme" }).segment(password)]
    .length;
  return length >= SHORTEST && length <= LONGEST ? null : "password_invalid";
}
