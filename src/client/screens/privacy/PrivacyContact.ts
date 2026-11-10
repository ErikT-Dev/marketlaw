export type PrivacyContact =
  | { readonly kind: "loading" }
  | { readonly kind: "known"; readonly address: string }
  | { readonly kind: "unknown" };
