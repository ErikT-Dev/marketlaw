export type RandomDraw =
  { readonly kind: "listed"; readonly value: unknown } | { readonly kind: "free" };
