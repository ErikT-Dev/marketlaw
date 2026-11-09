const LONGEST = 254;
const EMAIL_SHAPE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/u;

export function emailProblem(email: string): "email_invalid" | null {
  const length = [...new Intl.Segmenter(undefined, { granularity: "grapheme" }).segment(email)]
    .length;
  return length <= LONGEST && EMAIL_SHAPE.test(email) ? null : "email_invalid";
}
