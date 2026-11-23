import * as v from "valibot";

export const ICON_COLOR = v.pipe(
  v.string(),
  v.regex(/^#[0-9a-fA-F]{6}$/u),
  v.transform((color) => color.toLowerCase()),
);
