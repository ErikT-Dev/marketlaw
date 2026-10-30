export type AlarmChange =
  | { readonly kind: "keep" }
  | { readonly kind: "set"; readonly at: number }
  | { readonly kind: "delete" };
